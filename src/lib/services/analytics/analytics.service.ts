import { apiFetch } from '../../api'
import { API_CACHE_TAGS } from '../cacheTags'
import type {
  AnalyticsOverviewResponse,
  OffersAnalyticsResponse,
} from './analytics.types'

export const getOffersAnalytics = async (): Promise<OffersAnalyticsResponse> =>
  apiFetch<OffersAnalyticsResponse>('/v1/analytics/offers', {
    method: 'GET',
    auth: true,
    cache: true,
    cacheTags: [API_CACHE_TAGS.analytics],
    errorMessage: 'Erro ao carregar métricas de ofertas',
    networkErrorMessage: 'Falha de rede ao carregar métricas de ofertas',
  })

export const getAnalyticsOverview =
  async (): Promise<AnalyticsOverviewResponse> =>
    apiFetch<AnalyticsOverviewResponse>('/v1/analytics/overview', {
      method: 'GET',
      auth: true,
      cache: true,
      cacheTags: [API_CACHE_TAGS.analytics],
      errorMessage: 'Erro ao carregar resumo do dashboard',
      networkErrorMessage: 'Falha de rede ao carregar resumo do dashboard',
    })
