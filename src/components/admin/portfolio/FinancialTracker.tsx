'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calculator, 
  CreditCard,
  Receipt,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  ArrowUp,
  ArrowDown,
  Percent,
  Building,
  Users,
  Zap,
  Activity,
  RefreshCw,
  Filter,
  Search,
  Bell
} from 'lucide-react'

// Types and Interfaces
interface FinancialTransaction {
  id: string
  project_id: string
  project_title: string
  category: 'income' | 'expense' | 'investment' | 'refund'
  type: 'planning' | 'actual' | 'forecast'
  amount: number
  currency: 'PEN' | 'USD'
  description: string
  date: string
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  payment_method?: 'bank_transfer' | 'check' | 'cash' | 'credit'
  reference_number?: string
  created_by: string
  approved_by?: string
  tags: string[]
  attachments?: string[]
}

interface BudgetPlan {
  id: string
  project_id: string
  project_title: string
  total_budget: number
  currency: 'PEN' | 'USD'
  categories: {
    category: string
    planned_amount: number
    spent_amount: number
    remaining_amount: number
    percentage: number
  }[]
  milestones: {
    id: string
    name: string
    planned_date: string
    planned_amount: number
    actual_date?: string
    actual_amount?: number
    status: 'pending' | 'completed' | 'overdue'
  }[]
  contingency_percentage: number
  created_at: string
  updated_at: string
}

interface FinancialAlert {
  id: string
  type: 'budget_overrun' | 'payment_due' | 'low_cash_flow' | 'milestone_delay'
  severity: 'low' | 'medium' | 'high' | 'critical'
  project_id: string
  project_title: string
  message: string
  amount?: number
  currency?: 'PEN' | 'USD'
  due_date?: string
  created_at: string
  is_read: boolean
}

interface CashFlowPeriod {
  period: string
  income: number
  expenses: number
  net_flow: number
  cumulative: number
}

interface FinancialTrackerProps {
  transactions?: FinancialTransaction[]
  budgetPlans?: BudgetPlan[]
  alerts?: FinancialAlert[]
  onTransactionsChange?: (transactions: FinancialTransaction[]) => void
  onBudgetPlansChange?: (plans: BudgetPlan[]) => void
  onCreateTransaction?: () => void
  onEditTransaction?: (transactionId: string) => void
  onDeleteTransaction?: (transactionId: string) => void
  onCreateBudget?: () => void
  onEditBudget?: (budgetId: string) => void
  onExportReport?: (type: 'pdf' | 'excel' | 'csv') => void
  className?: string
}

const TRANSACTION_CATEGORIES = {
  income: { label: 'Ingreso', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  expense: { label: 'Gasto', color: 'bg-red-100 text-red-800', icon: TrendingDown },
  investment: { label: 'Inversión', color: 'bg-blue-100 text-blue-800', icon: PiggyBank },
  refund: { label: 'Reembolso', color: 'bg-purple-100 text-purple-800', icon: Receipt }
}

const TRANSACTION_STATUS = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Aprobado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
}

const ALERT_SEVERITY = {
  low: { label: 'Bajo', color: 'bg-blue-100 text-blue-800' },
  medium: { label: 'Medio', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Alto', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Crítico', color: 'bg-red-100 text-red-800' }
}

const BUDGET_CATEGORIES = [
  'Personal',
  'Materiales',
  'Equipos',
  'Subcontratistas',
  'Permisos y Licencias',
  'Transporte',
  'Seguros',
  'Contingencias',
  'Supervisión',
  'Gastos Generales'
]

export default function FinancialTracker({ 
  transactions = [], 
  budgetPlans = [],
  alerts = [],
  onTransactionsChange,
  onBudgetPlansChange,
  onCreateTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onCreateBudget,
  onEditBudget,
  onExportReport,
  className 
}: FinancialTrackerProps) {
  // State Management
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'cashflow' | 'alerts'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d')
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null)
  const [selectedBudget, setSelectedBudget] = useState<BudgetPlan | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get unique projects for filter
  const uniqueProjects = useMemo(() => {
    const projects = [...new Set([
      ...transactions.map(t => ({ id: t.project_id, title: t.project_title })),
      ...budgetPlans.map(b => ({ id: b.project_id, title: b.project_title }))
    ])]
    return projects.filter((project, index, self) => 
      index === self.findIndex(p => p.id === project.id)
    )
  }, [transactions, budgetPlans])

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.project_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.reference_number?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus)
    }

    if (filterProject !== 'all') {
      filtered = filtered.filter(t => t.project_id === filterProject)
    }

    // Apply time range filter
    if (selectedTimeRange !== 'all') {
      const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : selectedTimeRange === '90d' ? 90 : 365
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate)
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, searchQuery, filterCategory, filterStatus, filterProject, selectedTimeRange])

  // Financial Summary
  const financialSummary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.category === 'income' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = filteredTransactions
      .filter(t => (t.category === 'expense' || t.category === 'investment') && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0)

    const pendingPayments = filteredTransactions
      .filter(t => t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0)

    const netProfit = totalIncome - totalExpenses
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

    // Budget utilization
    const totalBudgeted = budgetPlans.reduce((sum, b) => sum + b.total_budget, 0)
    const totalSpent = budgetPlans.reduce((sum, b) => 
      sum + b.categories.reduce((catSum, cat) => catSum + cat.spent_amount, 0), 0)
    const budgetUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

    return {
      totalIncome,
      totalExpenses,
      pendingPayments,
      netProfit,
      profitMargin,
      totalBudgeted,
      totalSpent,
      budgetUtilization
    }
  }, [filteredTransactions, budgetPlans])

  // Cash Flow Data
  const cashFlowData = useMemo((): CashFlowPeriod[] => {
    const months = []
    const currentDate = new Date()
    let cumulative = 0

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear() &&
               t.status === 'paid'
      })

      const income = monthTransactions
        .filter(t => t.category === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = monthTransactions
        .filter(t => t.category === 'expense' || t.category === 'investment')
        .reduce((sum, t) => sum + t.amount, 0)

      const netFlow = income - expenses
      cumulative += netFlow

      months.push({
        period: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        net_flow: netFlow,
        cumulative
      })
    }

    return months
  }, [transactions])

  // Unread alerts
  const unreadAlerts = alerts.filter(alert => !alert.is_read)

  // Event Handlers
  const handleCreateTransaction = useCallback(() => {
    onCreateTransaction?.()
  }, [onCreateTransaction])

  const handleEditTransaction = useCallback((transactionId: string) => {
    onEditTransaction?.(transactionId)
  }, [onEditTransaction])

  const handleDeleteTransaction = useCallback((transactionId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      onDeleteTransaction?.(transactionId)
    }
  }, [onDeleteTransaction])

  const handleCreateBudget = useCallback(() => {
    onCreateBudget?.()
  }, [onCreateBudget])

  const handleEditBudget = useCallback((budgetId: string) => {
    onEditBudget?.(budgetId)
  }, [onEditBudget])

  const handleExportReport = useCallback((type: 'pdf' | 'excel' | 'csv') => {
    onExportReport?.(type)
  }, [onExportReport])

  const handleViewTransaction = useCallback((transaction: FinancialTransaction) => {
    setSelectedTransaction(transaction)
  }, [])

  const handleViewBudget = useCallback((budget: BudgetPlan) => {
    setSelectedBudget(budget)
  }, [])

  const formatCurrency = useCallback((amount: number, currency: 'PEN' | 'USD' = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Seguimiento Financiero</h2>
          <p className="text-gray-600 mt-1">
            Gestiona presupuestos, transacciones y flujo de efectivo de proyectos
          </p>
        </div>
        <div className="flex gap-2">
          {unreadAlerts.length > 0 && (
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {unreadAlerts.length} alertas
            </Button>
          )}
          <Select onValueChange={(value) => handleExportReport(value as 'pdf' | 'excel' | 'csv')}>
            <SelectTrigger className="w-32">
              <Download className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Exportar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Transacciones
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Presupuestos
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Flujo de Caja
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                {unreadAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(financialSummary.totalIncome)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Últimos {selectedTimeRange === 'all' ? 'todos' : selectedTimeRange}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gastos Totales</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(financialSummary.totalExpenses)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Incluye inversiones
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Beneficio Neto</p>
                    <p className={`text-2xl font-bold ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(financialSummary.netProfit)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Margen: {financialSummary.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Utilización Presupuesto</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {financialSummary.budgetUtilization.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(financialSummary.totalSpent)} de {formatCurrency(financialSummary.totalBudgeted)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Flow Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Flujo de Caja (Últimos 12 Meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Gráfico de Flujo de Caja</p>
                  <p className="text-sm text-gray-500">Visualización de ingresos vs gastos mensuales</p>
                </div>
              </div>

              {/* Cash Flow Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Ingresos Promedio</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(cashFlowData.reduce((sum, period) => sum + period.income, 0) / cashFlowData.length)}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Gastos Promedio</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(cashFlowData.reduce((sum, period) => sum + period.expenses, 0) / cashFlowData.length)}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Flujo Neto Promedio</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(cashFlowData.reduce((sum, period) => sum + period.net_flow, 0) / cashFlowData.length)}
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Acumulado Actual</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatCurrency(cashFlowData[cashFlowData.length - 1]?.cumulative || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions & Pending Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transacciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTransactions.slice(0, 5).map((transaction) => {
                    const categoryConfig = TRANSACTION_CATEGORIES[transaction.category]
                    const statusConfig = TRANSACTION_STATUS[transaction.status]
                    const CategoryIcon = categoryConfig.icon
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${categoryConfig.color.replace('text-', 'bg-').replace('800', '200')}`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{transaction.project_title}</p>
                            <p className="text-xs text-gray-500 truncate max-w-32">{transaction.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.category === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.category === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <Badge className={statusConfig.color} size="sm">
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay transacciones</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pagos Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions
                    .filter(t => t.status === 'approved')
                    .slice(0, 5)
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{transaction.project_title}</p>
                          <p className="text-xs text-gray-500">{transaction.description}</p>
                          <p className="text-xs text-gray-400">
                            Vence: {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-orange-600">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <Badge className="bg-yellow-100 text-yellow-800" size="sm">
                            Pendiente
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
                {transactions.filter(t => t.status === 'approved').length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No hay pagos pendientes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar transacciones..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(TRANSACTION_CATEGORIES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(TRANSACTION_STATUS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterProject} onValueChange={setFilterProject}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los proyectos</SelectItem>
                      {uniqueProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button onClick={handleCreateTransaction} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Transacción
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                Mostrando {filteredTransactions.length} de {transactions.length} transacciones
              </p>
            </CardHeader>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Fecha</th>
                      <th className="text-left p-4">Proyecto</th>
                      <th className="text-left p-4">Descripción</th>
                      <th className="text-center p-4">Categoría</th>
                      <th className="text-right p-4">Monto</th>
                      <th className="text-center p-4">Estado</th>
                      <th className="text-center p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => {
                      const categoryConfig = TRANSACTION_CATEGORIES[transaction.category]
                      const statusConfig = TRANSACTION_STATUS[transaction.status]
                      
                      return (
                        <tr key={transaction.id} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="p-4">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{transaction.project_title}</p>
                              {transaction.reference_number && (
                                <p className="text-xs text-gray-500">Ref: {transaction.reference_number}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="max-w-xs truncate">{transaction.description}</p>
                          </td>
                          <td className="p-4 text-center">
                            <Badge className={categoryConfig.color}>
                              {categoryConfig.label}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <p className={`font-medium ${transaction.category === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.category === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                            </p>
                          </td>
                          <td className="p-4 text-center">
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewTransaction(transaction)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditTransaction(transaction.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron transacciones</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || filterCategory !== 'all' || filterStatus !== 'all' || filterProject !== 'all'
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'No hay transacciones registradas'
                    }
                  </p>
                  <Button onClick={handleCreateTransaction}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Transacción
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Presupuestos de Proyectos</h3>
            <Button onClick={handleCreateBudget} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Presupuesto
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {budgetPlans.map((budget) => {
              const utilizationPercentage = (budget.categories.reduce((sum, cat) => sum + cat.spent_amount, 0) / budget.total_budget) * 100
              
              return (
                <Card key={budget.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{budget.project_title}</h3>
                        <p className="text-sm text-gray-600">
                          Presupuesto Total: {formatCurrency(budget.total_budget, budget.currency)}
                        </p>
                      </div>
                      <Badge className={utilizationPercentage > 90 ? 'bg-red-100 text-red-800' : 
                        utilizationPercentage > 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                        {utilizationPercentage.toFixed(1)}% usado
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Budget Categories */}
                    <div className="space-y-3">
                      {budget.categories.slice(0, 3).map((category) => (
                        <div key={category.category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{category.category}</span>
                            <span>{formatCurrency(category.spent_amount)} / {formatCurrency(category.planned_amount)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${category.spent_amount > category.planned_amount ? 'bg-red-600' : 
                                category.spent_amount > category.planned_amount * 0.9 ? 'bg-yellow-600' : 'bg-green-600'}`}
                              style={{ width: `${Math.min((category.spent_amount / category.planned_amount) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      {budget.categories.length > 3 && (
                        <p className="text-xs text-gray-500">+{budget.categories.length - 3} categorías más</p>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewBudget(budget)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditBudget(budget.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {budgetPlans.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay presupuestos</h3>
                <p className="text-gray-600 mb-4">Comienza creando un presupuesto para tus proyectos</p>
                <Button onClick={handleCreateBudget}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Presupuesto
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Flujo de Caja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Período</th>
                      <th className="text-right py-3">Ingresos</th>
                      <th className="text-right py-3">Gastos</th>
                      <th className="text-right py-3">Flujo Neto</th>
                      <th className="text-right py-3">Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlowData.map((period) => (
                      <tr key={period.period} className="border-b last:border-b-0">
                        <td className="py-3 font-medium">{period.period}</td>
                        <td className="text-right py-3 text-green-600">
                          {formatCurrency(period.income)}
                        </td>
                        <td className="text-right py-3 text-red-600">
                          {formatCurrency(period.expenses)}
                        </td>
                        <td className={`text-right py-3 font-medium ${period.net_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(period.net_flow)}
                        </td>
                        <td className={`text-right py-3 font-medium ${period.cumulative >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatCurrency(period.cumulative)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'high' ? 'border-l-orange-500' :
                alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                        <Badge className={ALERT_SEVERITY[alert.severity].color}>
                          {ALERT_SEVERITY[alert.severity].label}
                        </Badge>
                        {!alert.is_read && (
                          <Badge variant="destructive" size="sm">Nuevo</Badge>
                        )}
                      </div>
                      <h3 className="font-medium">{alert.project_title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      {alert.amount && (
                        <p className="text-sm font-medium text-blue-600 mt-1">
                          Monto: {formatCurrency(alert.amount, alert.currency)}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(alert.created_at).toLocaleDateString()} - {new Date(alert.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {alerts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas</h3>
                <p className="text-gray-600">Todas las métricas financieras están bajo control</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de Transacción</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Proyecto</Label>
                  <p className="font-medium">{selectedTransaction.project_title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                  <p>{new Date(selectedTransaction.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Descripción</Label>
                <p>{selectedTransaction.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Monto</Label>
                  <p className={`text-lg font-bold ${selectedTransaction.category === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.category === 'income' ? '+' : '-'}{formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado</Label>
                  <Badge className={TRANSACTION_STATUS[selectedTransaction.status].color}>
                    {TRANSACTION_STATUS[selectedTransaction.status].label}
                  </Badge>
                </div>
              </div>

              {selectedTransaction.reference_number && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Número de Referencia</Label>
                  <p>{selectedTransaction.reference_number}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Creado por</Label>
                  <p>{selectedTransaction.created_by}</p>
                </div>
                {selectedTransaction.approved_by && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Aprobado por</Label>
                    <p>{selectedTransaction.approved_by}</p>
                  </div>
                )}
              </div>

              {selectedTransaction.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Etiquetas</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedTransaction.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Budget Detail Modal */}
      {selectedBudget && (
        <Dialog open={!!selectedBudget} onOpenChange={() => setSelectedBudget(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalle de Presupuesto - {selectedBudget.project_title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Budget Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Presupuesto Total</Label>
                  <p className="text-2xl font-bold">{formatCurrency(selectedBudget.total_budget, selectedBudget.currency)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Contingencia</Label>
                  <p className="text-lg font-medium">{selectedBudget.contingency_percentage}%</p>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-4">Categorías Presupuestales</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Categoría</th>
                        <th className="text-right py-2">Planificado</th>
                        <th className="text-right py-2">Gastado</th>
                        <th className="text-right py-2">Restante</th>
                        <th className="text-center py-2">% Usado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBudget.categories.map((category) => (
                        <tr key={category.category} className="border-b last:border-b-0">
                          <td className="py-2 font-medium">{category.category}</td>
                          <td className="text-right py-2">{formatCurrency(category.planned_amount)}</td>
                          <td className="text-right py-2">{formatCurrency(category.spent_amount)}</td>
                          <td className="text-right py-2">{formatCurrency(category.remaining_amount)}</td>
                          <td className="text-center py-2">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${category.percentage > 100 ? 'bg-red-600' : 
                                    category.percentage > 90 ? 'bg-yellow-600' : 'bg-green-600'}`}
                                  style={{ width: `${Math.min(category.percentage, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs">{category.percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Milestones */}
              {selectedBudget.milestones.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Hitos del Proyecto</h3>
                  <div className="space-y-3">
                    {selectedBudget.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-sm text-gray-600">
                            Planificado: {new Date(milestone.planned_date).toLocaleDateString()}
                            {milestone.actual_date && ` | Real: ${new Date(milestone.actual_date).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(milestone.planned_amount)}</p>
                          {milestone.actual_amount && (
                            <p className="text-sm text-gray-600">{formatCurrency(milestone.actual_amount)} real</p>
                          )}
                          <Badge className={milestone.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            milestone.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                            {milestone.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}