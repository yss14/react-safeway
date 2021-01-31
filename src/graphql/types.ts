import { DocumentNode } from "graphql"
import { GraphQLClient } from "./GraphQLClient"

export interface TypedGraphQLOperation<TData, TVar> {
	query: DocumentNode
	variables?: TVar
}

export type TypedGraphQLQuery<TData, TVar> = TypedGraphQLOperation<TData, TVar>

export interface TypedGraphQLMutation<TData, TVar> {
	mutation: DocumentNode
	variables?: TVar
}

export interface BaseGraphQLResolverArgs<TVar> {
	variables: TVar
	client: GraphQLClient
}
