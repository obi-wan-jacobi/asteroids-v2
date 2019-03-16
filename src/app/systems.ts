import IEntity from '../engine/interfaces/IEntity';
import { System } from '../engine/abstracts/System';
import {
    Ephemeral, Flair, IShape, Label, Pose, Shape, Steering, Thrust, Velocity,
} from './components';
import { Asteroid, Missile, MissileExplosion } from './entities';
import {
    fromGeoJSONCoordinatesToShapes, fromShapeToGeoJSONCoordinates, getMinMaxShapeBounds,
    isPointInsideShape, transformShape,
} from './geometry';
const martinez = require('martinez-polygon-clipping');

export class MissileSystem extends System {

    public once(): void {
        this.$.entities.forEvery(Missile)((missile) => {
            this.$.entities.forEvery(Asteroid)((asteroid) => {
                const asteroidShape = transformShape(asteroid.copy(Shape), asteroid.copy(Pose));
                for (const point of transformShape(missile.copy(Shape), missile.copy(Pose)).points) {
                    if (isPointInsideShape(point, asteroidShape)) {
                        missile.destroy();
                        break;
                    }
                }
            });
        });
    }

}

export class MissileExplosionSystem extends System {

    public once(): void {
        this.$.entities.forEvery(Asteroid)((asteroid: Asteroid) => {
            this.$.entities.forEvery(MissileExplosion)((explosion: MissileExplosion) => {
                const explosionShape = transformShape(explosion.copy(Shape), explosion.copy(Pose));
                const asteroidShape = transformShape(asteroid.copy(Shape), asteroid.copy(Pose));
                for (const point of explosionShape.points) {
                    if (isPointInsideShape(point, asteroidShape)) {
                        explodeAsteroid(explosionShape, asteroid);
                        break;
                    }
                }
            });
        });
    }

}

const explodeAsteroid = (explosionShape: IShape, asteroid: Asteroid): void => {
    const geoJSONCoordinates1 = fromShapeToGeoJSONCoordinates(explosionShape);
    const geoJSONCoordinates2 = fromShapeToGeoJSONCoordinates(
        transformShape(asteroid.copy(Shape), asteroid.copy(Pose)),
    );
    asteroid.destroy();
    const remainders = fromGeoJSONCoordinatesToShapes(martinez.diff(geoJSONCoordinates2, geoJSONCoordinates1));
    if (remainders.length === 0) {
        return;
    }
    remainders.forEach((remainder) => {
        const { x, y } = remainder.points.reduce((prev, cur) => ({ x: prev.x + cur.x, y: prev.y + cur.y }));
        const fragmentPose = {
            x: x / remainder.points.length,
            y: y / remainder.points.length,
            a: 0,
        };
        const fragment = asteroid.$.entities.create(Asteroid, { pose: fragmentPose, radius: 0 });
        fragment.mutate(Shape)({
            points: remainder.points.map((point) => ({ x: point.x - fragmentPose.x, y: point.y - fragmentPose.y })),
        });
        const { minX, maxX, minY, maxY } = getMinMaxShapeBounds(fragment.copy(Shape));
        const epsilon = 30;
        if (maxX - minX < epsilon && maxY - minY < epsilon) {
            fragment.destroy();
        }
    });
};

export class EphemeralSystem extends System {

    public once(): void {
        this.$.entities.forEachWith(Ephemeral)((entity: IEntity) => {
            const { remaining } = entity.copy(Ephemeral);
            if (remaining === 1) {
                return entity.destroy();
            }
            entity.mutate(Ephemeral)({
                remaining: remaining - 1,
            });
        });
    }

}

export class ThrustSystem extends System {

    public once(): void {
        this.$.entities.forEachWith(Thrust)((entity: IEntity) => {
            const pose = entity.copy(Pose);
            const thrust = entity.copy(Thrust);
            const velocity = entity.copy(Velocity);
            if (thrust.state === 'ACCELERATE') {
                entity.mutate(Velocity)({
                    x: velocity.x + thrust.increment * Math.cos(pose.a),
                    y: velocity.y + thrust.increment * Math.sin(pose.a),
                    w: velocity.w,
                });
            }
        });
    }

}

export class MovementSystem extends System {

    private __boundary = {
        minX: 0, minY: 0, maxX: 1280, maxY: 680,
    };

    public once(): void {
        this.$.entities.forEachWith(Velocity)((entity: IEntity) => {
            const pose = entity.copy(Pose);
            const velocity = entity.copy(Velocity);
            entity.mutate(Pose)({
                x: pose.x + velocity.x,
                y: pose.y + velocity.y,
                a: pose.a + velocity.w,
            });
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

export class SteeringSystem extends System {

    public once(): void {
        this.$.entities.forEachWith(Steering)((entity: IEntity) => {
            const steering = entity.copy(Steering);
            if (steering.direction === 'LEFT') {
                return turnLeft(entity);
            }
            if (steering.direction === 'RIGHT') {
                return turnRight(entity);
            }
        });
    }

}

const turnLeft = (ship: IEntity): void => {
    const pose = ship.copy(Pose);
    pose.a += - Math.PI / 48;
    ship.mutate(Pose)(pose);
};
const turnRight = (ship: IEntity): void => {
    const pose = ship.copy(Pose);
    pose.a += Math.PI / 48;
    ship.mutate(Pose)(pose);
};

export class ShapeSystem extends System {

    public draw(): void {
        this.$.entities.forEachWith(Shape)((entity: IEntity) => {
            this.$.viewport.drawShape(transformShape(entity.copy(Shape), entity.copy(Pose)));
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
