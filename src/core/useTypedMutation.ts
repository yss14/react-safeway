import { MutationFunction, MutationOptions, useMutation, UseMutationResult } from "react-query"

export function useTypedMutation<TData>(
	mutationFn: MutationFunction<TData, undefined>,
	opts?: MutationOptions<TData, unknown, undefined>,
): UseMutationResult<TData, unknown, undefined>
export function useTypedMutation<TData, TVar>(
	mutationFn: MutationFunction<TData, TVar>,
	opts?: MutationOptions<TData, unknown, TVar>,
): UseMutationResult<TData, unknown, TVar>
export function useTypedMutation<TData, TVar>(
	mutationFn: MutationFunction<TData, TVar>,
	opts?: MutationOptions<TData, unknown, TVar>,
): UseMutationResult<TData, unknown, TVar> {
	return useMutation(mutationFn, opts)
}
