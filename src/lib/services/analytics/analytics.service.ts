import { apiFetch } from '../../api'
import type { OffersAnalyticsResponse } from './analytics.types'

export const getOffersAnalytics = async (): Promise<OffersAnalyticsResponse> =>
  apiFetch<OffersAnalyticsResponse>('/v1/analytics/offers', {
    method: 'GET',
    auth: true,
    errorMessage: 'Erro ao carregar métricas de ofertas',
    networkErrorMessage: 'Falha de rede ao carregar métricas de ofertas',
  })
