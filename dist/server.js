"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const apollo_server_1 = require("apollo-server");
const type_graphql_1 = require("type-graphql");
const Schema_1 = require("./schema/Schema");
const serve = () => __awaiter(void 0, void 0, void 0, function* () {
    const server = new apollo_server_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({ resolvers: [Schema_1.RootResolver] }),
    });
    server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
        console.log(`Server ready at ${url}`);
    });
});
serve();
