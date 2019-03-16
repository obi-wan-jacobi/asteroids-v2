import IEntity from '../engine/interfaces/IEntity';
import { System } from '../engine/abstracts/System';
import {
    Ephemeral, Flair, IShape, Label, MissileLauncher, Pose, Shape, Steering, Thrust, Velocity,
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
        this.$.entities.forEvery(MissileExplosion)((explosion: MissileExplosion) => {
            this.$.entities.forEvery(Asteroid)((asteroid: Asteroid) => {
                const explosionShape = transformShape(explosion.copy(Shape), explosion.copy(Pose));
                const asteroidShape = transformShape(asteroid.copy(Shape), asteroid.copy(Pose));
                for (const point of explosionShape.points) {
                    if (isPointInsideShape(point, asteroidShape)) {
                        explodeAsteroid(explosionShape, asteroid);
                        return;
                    }
                }
                for (const point of asteroidShape.points) {
                    if (isPointInsideShape(point, explosionShape)) {
                        explodeAsteroid(explosionShape, asteroid);
                        return;
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

    const remainders = fromGeoJSONCoordinatesToShapes(martinez.diff(geoJSONCoordinates2, geoJSONCoordinates1));
    if (remainders.length === 0) {
        asteroid.destroy();
        return;
    }
    transformAsteroidFragment(asteroid, remainders.shift()!);
    remainders.forEach((remainder) => {
        const fragment = asteroid.$.entities.create(Asteroid, { pose: { x: 0, y: 0, a: 0 }, radius: 0 });
        transformAsteroidFragment(fragment, remainder);
    });
};

const transformAsteroidFragment = (asteroid: Asteroid, remainder: IShape): void => {
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

export class MissileLauncherSystem extends System {

    public once(): void {
        this.$.entities.forEachWith(MissileLauncher)((entity: IEntity) => {
            const launcher = entity.copy(MissileLauncher);
            if (launcher.state === 'FIRE' && launcher.cooldown === 0) {
                this.$.entities.create(Missile, { pose: entity.copy(Pose) });
                launcher.state = 'IDLE';
                launcher.cooldown = 30;
                entity.mutate(MissileLauncher)(launcher);
                return;
            }
            launcher.cooldown = launcher.cooldown > 0 ? launcher.cooldown - 1 : 0;
            entity.mutate(MissileLauncher)(launcher);
            return;
        });
    }

}
