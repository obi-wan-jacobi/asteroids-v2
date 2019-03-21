import IEntity from '../engine/interfaces/IEntity';
import { System } from '../engine/abstracts/System';
import {
    Acceleration, BooleanAsteroidSubtractor, Ephemeral, Flair,
    IPoint, IShape, Label, MissileLauncher, Pose, RenderingProfile, Shape, Thruster, Velocity,
} from './components';
import { Asteroid, Missile, ThrustStream } from './entities';
import {
    fromGeoJSONCoordinatesToShapes, fromShapeToGeoJSON,
    getEuclideanDistanceBetweenPoints, getMinMaxShapeBounds, transformShape,
} from './geometry';
import turf from 'turf';
const booleanOverlap = require('@turf/boolean-overlap').default;
const booleanContains = require('@turf/boolean-contains').default;

export class ThrustSystem extends System {

    public once(): void {
        this.$.entities.forEachWith(Thruster)((entity) => {
            const thruster = entity.copy(Thruster);
            if (thruster.state === 'ACCELERATE') {
                this.$.entities.create(ThrustStream, {
                    pose: entity.copy(Pose),
                    offset: { x: -10 },
                    width: 10,
                    length: 60,
                });
                return;
            }
        });
    }

}

export class MissileSystem extends System {

    public once(): void {
        this.$.entities.forEvery(Missile)((missile) => {
            this.$.entities.forEvery(Asteroid)((asteroid) => {
                const missileShape = transformShape(missile.copy(Shape), missile.copy(Pose));
                const asteroidShape = transformShape(asteroid.copy(Shape), asteroid.copy(Pose));
                const missileGeoJSON = fromShapeToGeoJSON(missileShape);
                const asteroidGeoJSON = fromShapeToGeoJSON(asteroidShape);
                if (booleanOverlap(missileGeoJSON, asteroidGeoJSON)) {
                    missile.destroy();
                    return;
                }
            });
        });
    }

}

export class BooleanAsteroidSubtractorSystem extends System {

    public once(): void {
        this.$.entities.forEachWith(BooleanAsteroidSubtractor)((subtractor: IEntity) => {
            this.$.entities.forEvery(Asteroid)((asteroid: Asteroid) => {
                const subtractorShape = transformShape(subtractor.copy(Shape), subtractor.copy(Pose));
                const asteroidShape = transformShape(asteroid.copy(Shape), asteroid.copy(Pose));
                const subtractorGeoJSON = fromShapeToGeoJSON(subtractorShape);
                const asteroidGeoJSON = fromShapeToGeoJSON(asteroidShape);
                if (booleanOverlap(subtractorGeoJSON, asteroidGeoJSON)
                || booleanContains(subtractorGeoJSON, asteroidGeoJSON)) {
                    explodeAsteroid(subtractorShape, asteroid);
                    return;
                }
            });
        });
    }

}

const explodeAsteroid = (explosionShape: IShape, asteroid: Asteroid): void => {
    const explosionGeoJSON = fromShapeToGeoJSON(explosionShape);
    const asteroidGeoJSON = fromShapeToGeoJSON(
        transformShape(asteroid.copy(Shape), asteroid.copy(Pose)),
    );
    let remainders: IShape[] = [];
    try {
        remainders = fromGeoJSONCoordinatesToShapes(turf.difference(asteroidGeoJSON, explosionGeoJSON));
    } catch {
        remainders = [];
    }
    if (remainders.length === 0) {
        asteroid.destroy();
        return;
    }
    remainders.forEach(collapseExtraneousVertices);
    transformAsteroidFragment(asteroid, remainders.shift()!);
    remainders.forEach((remainder) => {
        const fragment = asteroid.$.entities.create(Asteroid, { pose: { x: 0, y: 0, a: 0 }, radius: 0 });
        transformAsteroidFragment(fragment, remainder);
    });
};

const collapseExtraneousVertices = (shape: IShape) => {
    let collapsed: IPoint[] = [];
    while (shape.points.length) {
        const line = collapse(shape.points);
        collapsed = collapsed.concat(line);
    }
    shape.points = collapsed;
};

const collapse = (target: IPoint[]): IPoint[] => {
    if (target.length === 0) {
        return [];
    }
    const epsilon = 10;
    let point = target.shift()!;
    let arc = [point];
    while (target.length > 1) {
        if (epsilon > getEuclideanDistanceBetweenPoints(point, target[0])
            && epsilon > getEuclideanDistanceBetweenPoints(target[0], target[1])
        ) {
            arc.push(target.shift()!);
            point = target.shift()!;
            arc.push(point);
        } else {
            break;
        }
    }
    if (arc.length >= 3) {
        arc = [arc[0], arc[Math.floor(arc.length / 2)], arc[arc.length - 1]];
    }
    return arc;
};

const transformAsteroidFragment = (asteroid: Asteroid, remainder: IShape): void => {
    if (remainder.points.length < 4) {
        asteroid.destroy();
        return;
    }
    const { x, y } = remainder.points.reduce((prev, cur) => ({ x: prev.x + cur.x, y: prev.y + cur.y }));
    const fragmentPose = {
        x: x / remainder.points.length,
        y: y / remainder.points.length,
        a: 0,
    };
    asteroid.mutate(Shape)({
        points: remainder.points.map((point) => ({ x: point.x - fragmentPose.x, y: point.y - fragmentPose.y })),
    });
    asteroid.mutate(Pose)(fragmentPose);
    const { minX, maxX, minY, maxY } = getMinMaxShapeBounds(asteroid.copy(Shape));
    const epsilon = 30;
    if (maxX - minX < epsilon && maxY - minY < epsilon) {
        asteroid.destroy();
    }
};

export class EphemeralSystem extends System {

    public once(): void {
        this.$.entities.forEachWith(Ephemeral)((entity: IEntity) => {
            const { remaining } = entity.copy(Ephemeral);
            if (remaining <= 0) {
                return entity.destroy();
            }
            entity.mutate(Ephemeral)({
                remaining: remaining - this.$.delta,
            });
        });
    }

}

export class AccelerationSystem extends System {

    public once(): void {
        this.$.entities.forEachWith(Acceleration)((entity: IEntity) => {
            const acceleration = entity.copy(Acceleration);
            const velocity = entity.copy(Velocity);
            entity.mutate(Velocity)({
                x: velocity.x + this.$.delta * acceleration.x,
                y: velocity.y + this.$.delta * acceleration.y,
                w: velocity.w + this.$.delta * acceleration.w,
            });
        });
    }

}

export class MissileLauncherSystem extends System {

    public once(): void {
        this.$.entities.forEachWith(MissileLauncher)((entity: IEntity) => {
            const launcher = entity.copy(MissileLauncher);
            if (launcher.state === 'FIRE' && launcher.timer >= launcher.cooldown) {
                this.$.entities.create(Missile, { pose: entity.copy(Pose) });
                launcher.state = 'IDLE';
                launcher.timer = 0;
                entity.mutate(MissileLauncher)(launcher);
                return;
            }
            launcher.timer = launcher.timer < launcher.cooldown ? launcher.timer + this.$.delta : launcher.cooldown;
            entity.mutate(MissileLauncher)(launcher);
            return;
        });
    }

}

export class MovementSystem extends System {

    private __boundary = {
        minX: 0, minY: 0, maxX: 1280, maxY: 680,
    };

    public once(): void {
        this.$.entities.forEachWith(Velocity)((entity: IEntity) => {
            // velocity system
            const pose = entity.copy(Pose);
            const velocity = entity.copy(Velocity);
            entity.mutate(Pose)({
                x: pose.x + this.$.delta * velocity.x,
                y: pose.y + this.$.delta * velocity.y,
                a: pose.a + this.$.delta * velocity.w,
            });
            // boundary system
            let { x, y, a } = entity.copy(Pose);
            if (x < this.__boundary.minX) {
                x = this.__boundary.maxX;
            }
            if (x > this.__boundary.maxX) {
                x = this.__boundary.minX;
            }
            if (y < this.__boundary.minY) {
                y = this.__boundary.maxY;
            }
            if (y > this.__boundary.maxY) {
                y = this.__boundary.minY;
            }
            a = a;
            entity.mutate(Pose)({ x, y, a });
        });
    }

}

export class ShapeSystem extends System {

    public draw(): void {
        this.$.entities.forEachWith(Shape)((entity: IEntity) => {
            const rendering = entity.copy(RenderingProfile);
            if (rendering) {
                this.$.viewport.drawShape({
                    shape: transformShape(entity.copy(Shape), entity.copy(Pose)),
                    rendering,
                });
            }
        });
    }
}

export class LabelSystem extends System {

    public draw(): void {
        this.$.entities.forEachWith(Label)((entity: IEntity) => {
            this.$.viewport.drawLabel({
                pose: entity.copy(Pose),
                label: entity.copy(Label),
            });
        });
    }
}

export class FlairSystem extends System {

    public draw(): void {
        this.$.entities.forEachWith(Flair)((entity: IEntity) => {
            const pose = entity.copy(Pose);
            const flair = entity.copy(Flair);
            const shape = { points: [
                { x: flair.offset.x, y: - flair.width / 2 },
                { x: - flair.length, y: 0 },
                { x: flair.offset.x, y: flair.width / 2 },
            ]};
            const transform = transformShape(shape, pose);
            this.$.viewport.drawLine({
                points: transform.points,
                rendering: { colour: 'red' },
            });
        });
    }

}

export class FPSSystem extends System {

    private __printValue = '';
    private __nodeCount = 0;
    private __printCounter = 0;

    public draw(): void {
        let nodes = 0;
        this.__printCounter++;
        if (this.__printCounter === 30) {
            this.$.entities.forEach((entity) => {
                const shape = entity.copy(Shape);
                if (shape) {
                    nodes += shape.points.length;
                    // transformShape(shape, entity.copy(Pose)).points.forEach((point) => {
                    //     this.$.viewport.drawPoint({ point });
                    // });
                }
            });
            this.__printCounter = 0;
            this.__printValue = `${Math.round(1000 / this.$.delta)}`;
            this.__nodeCount = nodes;
        }
        this.$.viewport.drawLabel({
            pose: { x: 0, y: 680, a: 0 },
            label: { fontSize: 20, text: this.__printValue, offset: { x: 0, y: 0 } },
        });
        this.$.viewport.drawLabel({
            pose: { x: 28, y: 680, a: 0 },
            label: { fontSize: 20, text: ':', offset: { x: 0, y: 0 } },
        });
        this.$.viewport.drawLabel({
            pose: { x: 40, y: 680, a: 0 },
            label: { fontSize: 20, text: `${this.__nodeCount}`, offset: { x: 0, y: 0 } },
        });
    }

}
