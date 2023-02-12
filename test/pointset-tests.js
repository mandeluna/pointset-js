import { PointSet } from '../pointset/PointSet.js';
import { Point } from '../pointset/geometry.js';
import { open } from 'node:fs/promises';

const args = process.argv;

if (args.length < 3) {
  console.log('Usage <insert_points> [<lookup_points>]');
  process.exit();
}

const insert_points = args[2];
const lookup_points = args.length >= 3 ? +args[3] : 0;

/** --- Insertion --- **/

const file = await open(insert_points, 'r');

const tree = new PointSet();

let insertion_count = 0;

try {
  for await (const line of file.readLines()) {
    const [x, y] = line.split(' ').map(ordinate => parseFloat(ordinate));
    const point = new Point(x, y);
    tree.insert(point)
    insertion_count++;
  }
}
finally {
  file?.close();
}

// console.log(`Inserted ${insertion_count} points from ${insert_points}`);

if (!lookup_points) {
  process.exit(0);
}

/** --- Lookup --- **/

const lookup_file = await open(insert_points, 'r');

let count = 0;

try {
  for await (const line of lookup_file.readLines()) {
    if (count >= lookup_points) {
      break;
    }
    const [x, y] = line.split(' ').map(ordinate => parseFloat(ordinate));
    const point = new Point(x, y);
    const lookup = tree.nearest(point);
    if (lookup === null) {
      throw new Error("Point not found: " + point);
    }
    count++;
  }
}
finally {
  lookup_file?.close();
}
