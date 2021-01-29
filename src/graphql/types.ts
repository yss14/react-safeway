import { DocumentNode } from "graphql"

export interface TypedGraphQLOperation<TData, TVar> {
	query: DocumentNode
	variables?: TVar
}
