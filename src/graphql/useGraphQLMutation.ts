import { DocumentNode } from "graphql"
import { useMutation, UseMutationOptions } from "react-query"
import { GraphQLClient } from "./GraphQLClient"
import { useGraphQLClient } from "./GraphQLClientContext"
import { TypedGraphQLOperation } from "./types"

interface GraphQLVariables<TVar> {
	variables?: TVar
}

export interface BaseResolverArgs<TVar> {
	variables: TVar
	client: GraphQLClient
}

export interface MutationResolverArgs<TVar> extends BaseResolverArgs<TVar> {
	mutation: DocumentNode
}

export interface UseGraphQLMutationOptions<TData, TVar = {}>
	extends UseMutationOptions<TData, unknown, TVar>,
		GraphQLVariables<TVar> {
	operatioName?: string
	resolver?: (args: MutationResolverArgs<TVar>) => TData | Promise<TData>
}

export const useGraphQLMutation = <TData, TVar extends {} = {}>(
	{ query: mutation }: TypedGraphQLOperation<TData, TVar>, // TODO remove renaming
	{ variables = {} as TVar, resolver, ...opts }: UseGraphQLMutationOptions<TData, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const queryObject = useMutation<TData, unknown, TVar>(async () => {
		if (resolver) {
			return resolver({ mutation, client: graphQLClient, variables })
		} else {
			return graphQLClient.request<TData, TVar>({ query: mutation, variables })
		}
	}, opts)

	return queryObject
}
