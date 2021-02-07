import { QueryKey } from "react-query"

export interface TypedQueryBase<TData, TVar> {
	__varType: TVar
	__dataType: TData
}

export interface TypedQueryWithoutVariables<TData> extends TypedQueryBase<TData, undefined> {
	key: QueryKey | (() => QueryKey)
}

export interface TypedQueryWithVariables<TData, TVar> extends TypedQueryBase<TData, TVar> {
	key: QueryKey | ((variables: TVar) => QueryKey)
}

export type TypedQuery<TData, TVar> = TypedQueryWithoutVariables<TData> | TypedQueryWithVariables<TData, TVar>

export type TypedQueryArgs<TData, TVar = undefined> = Pick<TypedQuery<TData, TVar>, "key">

export function TypedQuery<TData>(args: TypedQueryArgs<TData>): TypedQueryWithoutVariables<TData>
export function TypedQuery<TData, TVar>(args: TypedQueryArgs<TData, TVar>): TypedQueryWithVariables<TData, TVar>
export function TypedQuery<TData, TVar>(args: TypedQueryArgs<TData, TVar>): TypedQuery<TData, TVar> {
	return {
		...args,
		__dataType: {} as TData,
		__varType: {} as TVar,
	}
}
