NestJS API to access MongoDB Pictohub data.

Requests are secured by x-api-key header.

More infos on https://pictohub-api.gandi.asidiras.dev/api#/default/AppController_search

/search takes three URL parameters:
1) **index**: For now it has only one possible value (**default**)
2) **term**: The term Pictohub has to search for
3) **path**: An array of object paths, $LANG is a two letter ISO (fr, en, es etc) (["keywords.$LANG.keyword", "keywords.$LANG.synonymes", "keywords.$LANG.lexical_siblings", "keywords.$LANG.plural"]) 
