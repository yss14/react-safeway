import { RESTMutation, RESTQuery } from "rest/types"
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

const ORGANIZATION_JOBS_QUERY = RESTQuery<Job[], OrganizationJobsVariables>({
	key: ({ organizationID }) => ["organizations", organizationID, "jobs"],
	url: ({ organizationID }) => `/organizations/${organizationID}/jobs`,
})

const useOrganizations = (opts?: RESTQueryOpts<typeof ORGANIZATION_JOBS_QUERY>) => {
	return useRESTQuery(ORGANIZATION_JOBS_QUERY, opts)
}

interface UpdateOrganizationTierPayload {
	organizationID: number
	tier: string
}

const UPDATE_ORGANIZATION_TIER = RESTMutation<Organization, UpdateOrganizationTierPayload, void>({
	method: "PATCH",
	url: ({ organizationID }) => `/organizations/${organizationID}/tier`,
})
