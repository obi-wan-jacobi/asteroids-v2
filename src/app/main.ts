import App from './App';
import Engine from '../engine/Engine';
import { Entity } from '../engine/Entity';
import HTML5CanvasKeyboardAdapter from '../html5-canvas/HTML5CanvasKeyboardAdaptor';
import HTML5CanvasMouseAdaptor from '../html5-canvas/HTML5CanvasMouseAdaptor';
import { HTML5CanvasViewportAdaptor } from '../html5-canvas/HTML5CanvasViewportAdaptor';
import KeyboardHandler from '../engine/KeyboardHandler';
import { Label, Pose } from './components';
import { Asteroid, Ship } from './entities';
import $ from 'jquery';
import {
    BoundarySytem, CollisionSystem, EphemeralSystem, ExplosionSystem, FlairSystem,
    LabelSystem, ShapeSystem, SteeringSystem, ThrustSystem, VelocitySystem,
} from './systems';

const canvas = $('#app-target').get(0) as HTMLCanvasElement;
canvas.focus();
canvas.width = 1280;
canvas.height = 680;

const app = new App({
    viewport: new HTML5CanvasViewportAdaptor(canvas),
    mouse: new HTML5CanvasMouseAdaptor(canvas),
    keyboard: new HTML5CanvasKeyboardAdapter(canvas),
    game: new Engine(),
});

app.game.systems.add(VelocitySystem);
app.game.systems.add(BoundarySytem);
app.game.systems.add(SteeringSystem);
app.game.systems.add(ThrustSystem);
app.game.systems.add(EphemeralSystem);

app.game.systems.add(CollisionSystem, app.game.entities);
app.game.systems.add(ExplosionSystem, app.game.entities);

app.game.drawSystems.add(LabelSystem, { viewport: app.viewport });
app.game.drawSystems.add(ShapeSystem, { viewport: app.viewport });
app.game.drawSystems.add(FlairSystem, { viewport: app.viewport });

app.start();

const setup = (): void => {
    const startBlurb = app.game.entities.create(Entity);
    startBlurb.add(Pose)({ x: 1280 / 2, y: 680 / 2, a: 0 });
    startBlurb.add(Label)({ text: 'Press SPACE to begin...', fontSize: 40, offset: { x: -200, y: 0 } });
    const startKeyboardHandler = new KeyboardHandler();
    startKeyboardHandler.keyups = {
        ' ': () => {
            app.game.entities.destroy(startBlurb);
            begin();
        },
    };
    app.keyboard.handler(startKeyboardHandler);
    startKeyboardHandler.keyups[' ']({ name: 'skip', key: ' ' });
};

const begin = (): void => {
    const ship = app.game.entities.create(Ship, { pose: { x: 1000, y: 340, a: Math.PI } });
    const shipKeyboardHandler = new KeyboardHandler();
    shipKeyboardHandler.keydowns = {
        ArrowUp: () => ship.accelerate(),
        ArrowLeft: () => ship.turnLeft(),
        ArrowRight: () => ship.turnRight(),
        ' ': () => ship.shoot(),
    };
    shipKeyboardHandler.keyups = {
        ArrowUp: () => ship.idle(),
        ArrowLeft: () => ship.stopTurningLeft(),
        ArrowRight: () => ship.stopTurningRight(),
        r: () => app.game.entities.create(Asteroid, { pose: { x: 640, y: 340, a: 0 }, radius: 200 }),
    };
    app.keyboard.handler(shipKeyboardHandler);
};

setup();

// import { IPoint } from './components';
// import {
//     fromShapeToGeoJSONCoordinates, fromShapeToLineSegments,
//     getEuclideanDistanceBetweenPoints,
//     getPointOfIntersectionBetweenLinesFromSegments,
// } from './geometry';
// import $ from 'jquery';
// const martinez =  require('martinez-polygon-clipping');

// const canvas = $('#app-target').get(0) as HTMLCanvasElement;
// canvas.width = 1280;
// canvas.height = 680;
// const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// const shape1 = [1, 2, 3, 4, 5, 6].map((i) => {
//     return {
//         x: 200 * Math.cos(i * 2 * Math.PI / 6) + 600,
//         y: 200 * Math.sin(i * 2 * Math.PI / 6) + 300,
//     };
// });

// const shape2 = [1, 2, 3, 4, 5, 6].map((i) => {
//     return {
//         x: 50 * Math.cos(i * 2 * Math.PI / 6) + 800,
//         y: 50 * Math.sin(i * 2 * Math.PI / 6) + 250,
//     };
// });

// const drawShape = (shape: IPoint[], colour: string): void => {
//     ctx.save();
//     ctx.strokeStyle = colour;
//     ctx.beginPath();
//     shape.forEach((vertex) => {
//         ctx.lineTo(vertex.x, vertex.y);
//     });
//     ctx.closePath();
//     ctx.stroke();
//     ctx.restore();
// };

// const drawPoint = (point: IPoint, colour: string): void => {
//     ctx.save();
//     ctx.strokeStyle = colour;
//     ctx.beginPath();
//     ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
//     ctx.closePath();
//     ctx.stroke();
//     ctx.restore();
// };

// drawShape(shape1, 'red');
// drawShape(shape2, 'blue');

// const isColinearPointOnSegment = (intersection: IPoint, segment: { head: IPoint, tail: IPoint }): boolean => {
//     const dMax = getEuclideanDistanceBetweenPoints(segment.tail, segment.head);
//     const dIntersectionToTail = getEuclideanDistanceBetweenPoints(intersection, segment.tail);
//     const dIntersectionToHead = getEuclideanDistanceBetweenPoints(intersection, segment.head);
//     return dIntersectionToTail < dMax && dIntersectionToHead < dMax;
// };

// const drawIntersections = (shapeA: IPoint[], shapeB: IPoint[]): void => {
//     const shapeASegments = fromShapeToLineSegments({ points: shapeA });
//     const shapeBSegments = fromShapeToLineSegments({ points: shapeB });
//     shapeASegments.forEach((segmentA) => {
//         shapeBSegments.forEach((segmentB) => {
//             const intersection = getPointOfIntersectionBetweenLinesFromSegments(segmentA, segmentB);
//             const isIntersectionOnSegmentA = isColinearPointOnSegment(intersection, segmentA);
//             const isIntersectionOnSegmentB = isColinearPointOnSegment(intersection, segmentB);
//             if (isIntersectionOnSegmentA && isIntersectionOnSegmentB) {
//                 drawPoint(intersection, 'green');
//             }
//         });
//     });
// };

// drawIntersections(shape1, shape2);

// const gjson1 = fromShapeToGeoJSONCoordinates({ points: shape1 });

// const gjson2 = fromShapeToGeoJSONCoordinates({ points: shape2 });

// console.log(gjson1);
// console.log(gjson2);
// let diff = martinez.diff(gjson1, gjson2);

// diff = diff[0][0] as [];

// diff.forEach((vertex: number[]) => {
//     drawPoint({ x: vertex[0], y: vertex[1] }, 'pink');
// });
