import { DocumentNode } from "graphql"
import { useQuery, UseQueryOptions } from "react-query"
import { useGraphQLClient } from "./GraphQLClientContext"
import { BaseGraphQLResolverArgs, TypedGraphQLOperation } from "./types"

const getQueryKey = (query: DocumentNode): string => {
	// TODO resolve any type
	return (query.definitions[0] as any).name.value
}

interface GraphQLVariables<TVar> {
	variables?: TVar
}

export interface QueryResolverArgs<TVar> extends BaseGraphQLResolverArgs<TVar> {
	query: DocumentNode
}

export type GraphQLQueryOpts<T> = T extends TypedGraphQLOperation<infer TData, infer TVar>
	? UseGraphQLQueryOptions<TData, TVar>
	: never

export interface UseGraphQLQueryOptions<TData, TVar> extends UseQueryOptions<TData>, GraphQLVariables<TVar> {
	operatioName?: string
	resolver?: (args: QueryResolverArgs<TVar>) => TData | Promise<TData>
}

export const useGraphQLQuery = <TData, TVar>(
	{ query }: TypedGraphQLOperation<TData, TVar>,
	{ variables, operatioName = getQueryKey(query), resolver, ...opts }: UseGraphQLQueryOptions<TData, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const cachingKey = [operatioName, variables]

	const queryObject = useQuery<TData, unknown, TData>(
		cachingKey,
		async () => {
			if (resolver) {
				return resolver({ query, client: graphQLClient, variables: variables! }) // TODO resolve optinal TVar property passed to resolver
			} else {
				return graphQLClient.request<TData, TVar>({ query, variables })
			}
		},
		opts,
	)

	return queryObject
}
