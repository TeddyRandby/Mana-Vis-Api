import "reflect-metadata";

import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { RootResolver } from "./schema/schema";

const serve = async () => {
  const server = new ApolloServer({
    schema: await buildSchema({ resolvers: [RootResolver] }),
  });

  server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
  });
};

serve();
