import { DocumentNode } from "graphql"
import { useMutation, UseMutationOptions } from "react-query"
import { useGraphQLClient } from "./GraphQLClientContext"
import { BaseGraphQLResolverArgs, TypedGraphQLMutation } from "./types"

interface GraphQLVariables<TVar> {
	variables?: TVar
}

export interface MutationResolverArgs<TVar> extends BaseGraphQLResolverArgs<TVar> {
	mutation: DocumentNode
}

export interface UseGraphQLMutationOptions<TData, TVar>
	extends UseMutationOptions<TData, unknown, TVar>,
		GraphQLVariables<TVar> {
	operatioName?: string
	resolver?: (args: MutationResolverArgs<TVar>) => TData | Promise<TData>
}

export const useGraphQLMutation = <TData, TVar>(
	{ mutation }: TypedGraphQLMutation<TData, TVar>,
	{ resolver, ...opts }: UseGraphQLMutationOptions<TData, TVar> = {},
) => {
	const graphQLClient = useGraphQLClient()

	const queryObject = useMutation<TData, unknown, TVar>(async (variables) => {
		if (resolver) {
			return resolver({ mutation, client: graphQLClient, variables })
		} else {
			return graphQLClient.request<TData, TVar>({ query: mutation, variables })
		}
	}, opts)

	return queryObject
}
