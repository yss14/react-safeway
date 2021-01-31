import { useMutation } from "react-query"
import { RESTMutation, RESTQuery, TypedRESTQuery } from "rest/types"
import { RESTQueryOpts, useRESTQuery } from "rest/useRESTQuery"

interface Organization {
	id: number
	name: string
	tier: string
}

interface Job {
	id: number
	title: string
}

const ORGANIZATIONS_QUERY = RESTQuery<Organization[], void>({
	key: "organizations",
	url: "/organizations",
})

interface OrganizationJobsVariables {
	organizationID: number
}

const Transform = <TDataTransformed, TData, TVar>(
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
)

const useOrganizations = (opts?: RESTQueryOpts<typeof ORGANIZATION_JOBS_QUERY>) => {
	return useRESTQuery(ORGANIZATION_JOBS_QUERY, {
		onSuccess: (data) => {},
	})
}

interface UpdateOrganizationTierPayload {
	organizationID: number
	tier: string
}

const UPDATE_ORGANIZATION_TIER = RESTMutation<Organization, UpdateOrganizationTierPayload, void>({
	method: "PATCH",
	url: ({ organizationID }) => `/organizations/${organizationID}/tier`,
})
