import unkinkPolygon from '@turf/unkink-polygon';
import IEntity from '../engine/interfaces/IEntity';
import { System } from '../engine/abstracts/System';
import {
    Acceleration, BooleanAsteroidSubtractor, Ephemeral, Flair,
    Hull, IShape, Label, MissileLauncher, Pose, RenderingProfile, Shape, Thruster, Velocity,
} from './components';
import { Asteroid, Missile, ThrustStream } from './entities';
import { Feature, FeatureCollection, GeoJsonProperties, Polygon } from 'geojson';
import {
    fromGeoJSONCoordinatesToShapes, fromShapeToBoundary, fromShapeToGeoJSON, transformShape,
} from './geometry';
import turf from 'turf';
const booleanOverlap = require('@turf/boolean-overlap').default;
const booleanContains = require('@turf/boolean-contains').default;
const centerOfMass = require('@turf/center-of-mass').default;

export class ThrustSystem extends System {

    public once(): void {
        this.$.entities.forEachWith(Thruster)((entity) => {
            const thruster = entity.copy(Thruster);
            if (thruster.state === 'ACCELERATE') {
                const factor = 0.0003;
                const pose = entity.copy(Pose);
                const acceleration = entity.copy(Acceleration);
                acceleration.x = factor * Math.cos(pose.a);
                acceleration.y = factor * Math.sin(pose.a);
                entity.mutate(Acceleration)(acceleration);
                this.$.entities.create(ThrustStream, {
                    pose: entity.copy(Pose),
                    offset: { x: -10 },
                    width: 10,
                    length: 60,
                });
                entity.add(Flair)({
                    offset: { x: -10 },
                    length: 60,
                    width: 10,
                });
                return;
            }
            entity.remove(Flair);
        });
    }

}

export class HullSystem extends System {

    public once(): void {
        this.$.entities.forEachWith(Hull)((entity) => {
            this.$.entities.forEvery(Asteroid)((asteroid) => {
                const hullShape = transformShape(entity.copy(Shape), entity.copy(Pose));
                const asteroidShape = transformShape(asteroid.copy(Shape), asteroid.copy(Pose));
                const hullGeoJSON = fromShapeToGeoJSON(hullShape);
                const asteroidGeoJSON = fromShapeToGeoJSON(asteroidShape);
                if (booleanOverlap(hullGeoJSON, asteroidGeoJSON)) {
                    return entity.destroy();
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
                    return diffAsteroid(subtractorShape, asteroid);
                }
            });
        });
    }

}

const diffAsteroid = (explosionShape: IShape, asteroid: Asteroid): void => {
    const explosionGeoJSON = fromShapeToGeoJSON(explosionShape);
    const asteroidGeoJSON = fromShapeToGeoJSON(
        transformShape(asteroid.copy(Shape), asteroid.copy(Pose)),
    );
    const diff = turf.difference(asteroidGeoJSON, explosionGeoJSON);
    if (!diff) {
        return asteroid.destroy();
    }
    const simple = turf.simplify(diff, 2, true) as Feature<Polygon, GeoJsonProperties>;
    if (!simple) {
        return asteroid.destroy();
    }
    let geojsons = [simple];
    if (turf.kinks(simple).features.length) {
        geojsons = (unkinkPolygon(simple) as FeatureCollection).features as
            Array<Feature<Polygon, GeoJsonProperties>>;
    }
    const remainders = geojsons
        .map(fromGeoJSONCoordinatesToShapes)
        .reduce((shapes1, shapes2) => shapes1.concat(shapes2))
        .sort((shape1, shape2) => {
            return turf.area(fromShapeToGeoJSON(shape2)) - turf.area(fromShapeToGeoJSON(shape1));
        });
    transformAsteroidFragment(asteroid, remainders.shift()!);
    remainders.forEach((remainder) => {
        const fragment = asteroid.$.entities.create(Asteroid, {
            pose: { x: 0, y: 0, a: 0 },
            innerRadius: 0,
            outerRadius: 0,
            numberOfVertices: 0,
        });
        transformAsteroidFragment(fragment, remainder);
    });
};

const transformAsteroidFragment = (asteroid: Asteroid, remainder: IShape): void => {
    const { minX, maxX, minY, maxY } = fromShapeToBoundary(remainder);
    const epsilon = 30;
    if (remainder.points.length < 3 || (maxX - minX < epsilon && maxY - minY < epsilon)) {
        return asteroid.destroy();
    }
    const geojson = fromShapeToGeoJSON(remainder);
    const result = centerOfMass(geojson);
    const [x, y] = result.geometry.coordinates;
    asteroid.mutate(Shape)({
        points: remainder.points.map((point) => ({
            x: point.x - x,
            y: point.y - y,
        })),
    });
    asteroid.mutate(Pose)({ x, y, a: 0 });
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
                return entity.mutate(MissileLauncher)(launcher);
            }
            launcher.timer = launcher.timer < launcher.cooldown
                ? launcher.timer + this.$.delta
                : launcher.cooldown;
            return entity.mutate(MissileLauncher)(launcher);
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
                }
            });
            this.__printCounter = 0;
            this.__printValue = `${Math.round(1000 / this.$.delta)}`;
            this.__nodeCount = nodes;
        }
        this.$.viewport.drawLabel({
            pose: { x: 0, y: 680, a: 0 },
            label: {
                fontSize: 20,
                text: `${this.__printValue} : ${this.__nodeCount}`,
                offset: { x: 0, y: 0 },
            },
        });
    }

}
