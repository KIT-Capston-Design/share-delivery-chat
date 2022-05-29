import expressLoader from './express.js';

export default async ({ expressApp }) => {

  await expressLoader({ app: expressApp });
  console.log('Express Intialized');

}