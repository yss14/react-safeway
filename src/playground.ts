import { RESTQueryOpts, useRESTQuery } from "rest/useRESTQuery"
import { TypedQuery } from "./core/TypedQuery"
import { TypedQueryOpts, useTypedQuery } from "./core/useTypedQuery"
import { TypedRESTMutation } from "./rest/TypedRESTMutation"
import { RESTMutationOpts, useRESTMutation } from "./rest/useRESTMutation"

interface Organization {
	id: number
	name: string
	tier: string
}

interface Job {
	id: number
	title: string
}

const ORGANIZATIONS_QUERY = TypedQuery<Organization[], void>({
	key: "organizations",
})

interface OrganizationJobsVariables {
	organizationID: number
}

/*const Transform = <TDataTransformed, TData, TVar>(
	query: TypedRESTQuery<TData, TVar>,
	transformFn: (data: TData) => TDataTransformed,
): TypedRESTQuery<TDataTransformed, TVar> => ({
	...query,
})

const ORGANIZATION_JOBS_QUERY = Transform(
	RESTQuery<Job[], OrganizationJobsVariables>({
		key: ({ organizationID }) => ["organizations", organizationID, "jobs"],
		url: ({ organizationID }) => `/organizations/${organizationID}/jobs`,
	}),
	(data) => data.map((job) => job.id),
)*/

const ORGANIZATION_JOBS_QUERY = TypedQuery<Job[], OrganizationJobsVariables>({
	key: ({ organizationID }) => [`organization`, organizationID, "jobs"],
})

const useOrganizations = (opts?: RESTQueryOpts<typeof ORGANIZATION_JOBS_QUERY>) => {
	return useRESTQuery(ORGANIZATION_JOBS_QUERY, {
		variables: { organizationID: 32 },
		url: "yolo",
		...opts,
	})
}

interface UpdateOrganizationTierPayload {
	organizationID: number
	tier: string
}

const UPDATE_ORGANIZATION_TIER = TypedRESTMutation<
	Organization,
	UpdateOrganizationTierPayload,
	Pick<UpdateOrganizationTierPayload, "tier">
>({
	method: "PATCH",
})

const useUpdateOrganizationTier = (opts?: RESTMutationOpts<typeof UPDATE_ORGANIZATION_TIER>) => {
	return useRESTMutation(UPDATE_ORGANIZATION_TIER, {
		url: ({ organizationID }) => `/organizations/${organizationID}/tier`,
		payload: ({ tier }) => ({ tier }),
		...opts,
	})
}

const NEW_TYPED_QUERY = TypedQuery<string>({
	key: (args) => "organization",
})

type NewTypedQueryOpts = TypedQueryOpts<typeof NEW_TYPED_QUERY>

export const useMyTypedQuery = (opts?: NewTypedQueryOpts) => {
	return useTypedQuery(NEW_TYPED_QUERY, async () => "Yolo")
}
