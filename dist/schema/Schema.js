"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.RootResolver = exports.Deck = exports.ManaCard = exports.Pip = exports.ScryfallCard = exports.Card = void 0;
const type_graphql_1 = require("type-graphql");
const scraper_1 = require("../scraper/scraper");
const scryfallify_1 = require("../scryfall/scryfallify");
const manify_1 = require("../manify/manify");
let Card = class Card {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Card.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], Card.prototype, "count", void 0);
Card = __decorate([
    type_graphql_1.ObjectType("Card"),
    type_graphql_1.InterfaceType("CardInterface"),
    type_graphql_1.InputType("CardInput")
], Card);
exports.Card = Card;
let ScryfallCard = class ScryfallCard extends Card {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ScryfallCard.prototype, "scryfall_uri", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], ScryfallCard.prototype, "cmc", void 0);
__decorate([
    type_graphql_1.Field(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ScryfallCard.prototype, "colors", void 0);
__decorate([
    type_graphql_1.Field(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ScryfallCard.prototype, "color_identity", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], ScryfallCard.prototype, "type_line", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", String)
], ScryfallCard.prototype, "oracle_text", void 0);
ScryfallCard = __decorate([
    type_graphql_1.ObjectType({ implements: Card }),
    type_graphql_1.InterfaceType("ScryfallCardInterface")
], ScryfallCard);
exports.ScryfallCard = ScryfallCard;
let Pip = class Pip {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Pip.prototype, "colors", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], Pip.prototype, "amount", void 0);
Pip = __decorate([
    type_graphql_1.ObjectType()
], Pip);
exports.Pip = Pip;
let ManaCard = class ManaCard extends ScryfallCard {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], ManaCard.prototype, "score", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], ManaCard.prototype, "appearences", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], ManaCard.prototype, "onCurve", void 0);
__decorate([
    type_graphql_1.Field(() => [Pip]),
    __metadata("design:type", Array)
], ManaCard.prototype, "pips", void 0);
ManaCard = __decorate([
    type_graphql_1.ObjectType({ implements: ScryfallCard })
], ManaCard);
exports.ManaCard = ManaCard;
let Deck = class Deck {
};
__decorate([
    type_graphql_1.Field(() => [Card]),
    __metadata("design:type", Array)
], Deck.prototype, "cards", void 0);
Deck = __decorate([
    type_graphql_1.InputType("DeckInput")
], Deck);
exports.Deck = Deck;
let RootResolver = class RootResolver {
    scrape(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield scraper_1.scrapeDeck(url);
        });
    }
    scryfallifyURL(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield scryfallify_1.scryfallifyDeck(yield scraper_1.scrapeDeck(url));
            return data;
        });
    }
    manifyURL(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield manify_1.manifyDeck(yield scryfallify_1.scryfallifyDeck(yield scraper_1.scrapeDeck(url)));
        });
    }
    scryfallifyDeck(deck) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield scryfallify_1.scryfallifyDeck(deck.cards);
        });
    }
    manifyDeck(deck) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield manify_1.manifyDeck(yield scryfallify_1.scryfallifyDeck(deck.cards));
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [Card]),
    __param(0, type_graphql_1.Arg("url")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RootResolver.prototype, "scrape", null);
__decorate([
    type_graphql_1.Query(() => [ScryfallCard]),
    __param(0, type_graphql_1.Arg("url")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RootResolver.prototype, "scryfallifyURL", null);
__decorate([
    type_graphql_1.Query(() => [ManaCard]),
    __param(0, type_graphql_1.Arg("url")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RootResolver.prototype, "manifyURL", null);
__decorate([
    type_graphql_1.Query(() => [ScryfallCard], { nullable: true }),
    __param(0, type_graphql_1.Arg("deck")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Deck]),
    __metadata("design:returntype", Promise)
], RootResolver.prototype, "scryfallifyDeck", null);
__decorate([
    type_graphql_1.Query(() => [ManaCard], { nullable: true }),
    __param(0, type_graphql_1.Arg("deck")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Deck]),
    __metadata("design:returntype", Promise)
], RootResolver.prototype, "manifyDeck", null);
RootResolver = __decorate([
    type_graphql_1.Resolver()
], RootResolver);
exports.RootResolver = RootResolver;
