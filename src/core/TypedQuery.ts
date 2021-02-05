export interface TypedQuery<TData, TVar> {
	key: string | ((variables: TVar) => string)
	__varType: TVar
	__dataType: TData
}

export type TypedQueryArgs<TData, TVar> = Pick<TypedQuery<TData, TVar>, "key">

export const TypedQuery = <TData, TVar>(args: TypedQueryArgs<TData, TVar>): TypedQuery<TData, TVar> => ({
	...args,
	__dataType: {} as TData,
	__varType: {} as TVar,
})
