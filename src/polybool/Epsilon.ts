// (c) Copyright 2016, Sean Connelly (@voidqk), http://syntheti.cc
// MIT License
// Project Home: https://github.com/voidqk/polybooljs

//
// provides the raw computation s that takes epsilon into account
//
// zero is defined to be between (-epsilon, epsilon) exclusive
//

export default class Epsilon {

    private __eps: number;

    constructor(eps: number = 0.0000000001) {
        this.__eps = eps;
    }

    public pointAboveOrOnLine(point: number[], left: number[], right: number[]): boolean {
        const Ax = left[0];
        const Ay = left[1];
        const Bx = right[0];
        const By = right[1];
        const Cx = point[0];
        const Cy = point[1];
        return (Bx - Ax) * (Cy - Ay) - (By - Ay) * (Cx - Ax) >= -this.__eps;
    }

    public pointBetween(p: number[], left: number[], right: number[]): boolean {
        // p must be collinear with left->right
        // returns false if p == left, p == right, or left == right
        const d_py_ly = p[1] - left[1];
        const d_rx_lx = right[0] - left[0];
        const d_px_lx = p[0] - left[0];
        const d_ry_ly = right[1] - left[1];

        const dot = d_px_lx * d_rx_lx + d_py_ly * d_ry_ly;
        // if `dot` is 0, then `p` == `left` or `left` == `right` (reject)
        // if `dot` is less than 0, then `p` is to the left of `left` (reject)
        if (dot < this.__eps) {
            return false;
        }

        const sqlen = d_rx_lx * d_rx_lx + d_ry_ly * d_ry_ly;
        // if `dot` > `sqlen`, then `p` is to the right of `right` (reject)
        // therefore, if `dot - sqlen` is greater than 0, then `p` is to the right of `right` (reject)
        if (dot - sqlen > -this.__eps) {
            return false;
        }

        return true;
    }

    public pointsSameX(p1: number[], p2: number[]): boolean {
        return Math.abs(p1[0] - p2[0]) < this.__eps;
    }

    public pointsSameY(p1: number[], p2: number[]): boolean {
        return Math.abs(p1[1] - p2[1]) < this.__eps;
    }

    public pointsSame(p1: number[], p2: number[]): boolean {
        return this.pointsSameX(p1, p2) && this.pointsSameY(p1, p2);
    }

    public pointsCompare(p1: number[], p2: number[]): number {
        // returns -1 if p1 is smaller, 1 if p2 is smaller, 0 if equal
        if (this.pointsSameX(p1, p2)) {
            return this.pointsSameY(p1, p2) ? 0 : (p1[1] < p2[1] ? -1 : 1);
        }
        return p1[0] < p2[0] ? -1 : 1;
    }

    public pointsCollinear(pt1: number[], pt2: number[], pt3: number[]): boolean {
        // does pt1->pt2->pt3 make a straight line?
        // essentially this is just checking to see if the slope(pt1->pt2) === slope(pt2->pt3)
        // if slopes are equal, then they must be collinear, because they share pt2
        const dx1 = pt1[0] - pt2[0];
        const dy1 = pt1[1] - pt2[1];
        const dx2 = pt2[0] - pt3[0];
        const dy2 = pt2[1] - pt3[1];
        return Math.abs(dx1 * dy2 - dx2 * dy1) < this.__eps;
    }

    public linesIntersect(a0: number[], a1: number[], b0: number[], b1: number[]): {} | null {
        // returns false if the lines are coincident (e.g., parallel or on top of each other)
        //
        // returns an object if the lines intersect:
        //   {
        //     pt: [x, y],    where the intersection point is at
        //     alongA: where intersection point is along A,
        //     alongB: where intersection point is along B
        //   }
        //
        //  alongA and alongB will each be one of: -2, -1, 0, 1, 2
        //
        //  with the following meaning:
        //
        //    -2   intersection point is before segment's first point
        //    -1   intersection point is directly on segment's first point
        //     0   intersection point is between segment's first and second points (exclusive)
        //     1   intersection point is directly on segment's second point
        //     2   intersection point is after segment's second point
        const adx = a1[0] - a0[0];
        const ady = a1[1] - a0[1];
        const bdx = b1[0] - b0[0];
        const bdy = b1[1] - b0[1];

        const axb = adx * bdy - ady * bdx;
        if (Math.abs(axb) < this.__eps) {
            return null; // lines are coincident
        }

        const dx = a0[0] - b0[0];
        const dy = a0[1] - b0[1];

        const A = (bdx * dy - bdy * dx) / axb;
        const B = (adx * dy - ady * dx) / axb;

        const ret = {
            alongA: 0,
            alongB: 0,
            pt: [
                a0[0] + A * adx,
                a0[1] + A * ady,
            ],
        };

        // categorize where intersection point is along A and B

        // tslint:disable:curly
        if (A <= -this.__eps)
            ret.alongA = -2;
        else if (A < this.__eps)
            ret.alongA = -1;
        else if (A - 1 <= -this.__eps)
            ret.alongA = 0;
        else if (A - 1 < this.__eps)
            ret.alongA = 1;
        else
            ret.alongA = 2;

        if (B <= -this.__eps)
            ret.alongB = -2;
        else if (B < this.__eps)
            ret.alongB = -1;
        else if (B - 1 <= -this.__eps)
            ret.alongB = 0;
        else if (B - 1 < this.__eps)
            ret.alongB = 1;
        else
            ret.alongB = 2;

        return ret;
    }

    public pointInsideRegion(pt: number[], region: number[][]): boolean {
        const x = pt[0];
        const y = pt[1];
        let last_x = region[region.length - 1][0];
        let last_y = region[region.length - 1][1];
        let inside = false;
        // tslint:disable:prefer-for-of
        for (let i = 0; i < region.length; i++) {
            const curr_x = region[i][0];
            const curr_y = region[i][1];

            // if y is between curr_y and last_y, and
            // x is to the right of the boundary created by the line
            if ((curr_y - y > this.__eps) !== (last_y - y > this.__eps) &&
            (last_x - curr_x) * (y - curr_y) / (last_y - curr_y) + curr_x - x > this.__eps)
                inside = !inside;

            last_x = curr_x;
            last_y = curr_y;
        }
        return inside;
    }

}
