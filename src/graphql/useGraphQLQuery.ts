import { DocumentNode } from "graphql"
import { useQuery, UseQueryOptions } from "react-query"
import { GraphQLClient } from "./GraphQLClient"
import { useGraphQLClient } from "./GraphQLClientContext"
import { TypedGraphQLOperation } from "./types"

const getQueryKey = (query: DocumentNode): string => {
	// TODO resolve any type
	return (query.definitions[0] as any).name.value
}

interface GraphQLVariables<TVar> {
	variables?: TVar
}

export interface BaseResolverArgs<TVar> {
	variables: TVar
	client: GraphQLClient
}

export interface QueryResolverArgs<TVar> extends BaseResolverArgs<TVar> {
	query: DocumentNode
}

export type GraphQLQueryOpts<T> = T extends TypedGraphQLOperation<infer TData, infer TVar>
	? UseGraphQLQueryOptions<TData, TVar>
	: never

export interface UseGraphQLQueryOptions<TData, TVar = {}> extends UseQueryOptions<TData>, GraphQLVariables<TVar> {
	operatioName?: string
	resolver?: (args: QueryResolverArgs<TVar>) => TData | Promise<TData>
}

export const useGraphQLQuery = <TData, TVar extends {} = {}>(
	{ query }: TypedGraphQLOperation<TData, TVar>,
	{
		variables = {} as TVar,
		operatioName = getQueryKey(query),
		resolver,
		...opts
	}: UseGraphQLQueryOptions<TData, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const cachingKey = [operatioName, variables]

	const queryObject = useQuery<TData, unknown, TData>(
		cachingKey,
		async () => {
			if (resolver) {
				return resolver({ query, client: graphQLClient, variables })
			} else {
				return graphQLClient.request<TData, TVar>({ query, variables })
			}
		},
		opts,
	)

	return queryObject
}
