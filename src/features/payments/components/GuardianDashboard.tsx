'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Users, 
  Receipt, 
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import type { GuardianDashboardData, LinkedStudent, FeeStatus } from '../types';
import { ChapaPaymentModal } from './ChapaPaymentModal';

interface GuardianDashboardProps {
  data: GuardianDashboardData;
  onRefresh: () => void;
}

export function GuardianDashboard({ data, onRefresh }: GuardianDashboardProps) {
  const t = useTranslations('guardianPortal.dashboard');
  const [selectedStudent, setSelectedStudent] = useState<LinkedStudent | null>(null);
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePayClick = (student: LinkedStudent, feeId: string) => {
    setSelectedStudent(student);
    setSelectedFeeId(feeId);
    setIsPaymentModalOpen(true);
  };

  const getStatusBadge = (status: FeeStatus) => {
    const styles = {
      paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      partial: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      unpaid: 'bg-red-500/10 text-red-600 border-red-500/30',
      overdue: 'bg-red-500/10 text-red-600 border-red-500/30',
    };
    return <Badge variant="outline" className={styles[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalBalance')}</p>
                <p className="text-2xl font-bold mt-1">
                  ETB {data.total_balance.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('linkedStudents')}</p>
                <p className="text-2xl font-bold mt-1">{data.linked_students.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('recentPayments')}</p>
                <p className="text-2xl font-bold mt-1">
                  {data.recent_transactions?.length || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            {t('title')}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Receipt className="h-4 w-4" />
            {t('paymentHistory')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          {data.linked_students.map((student) => (
            <Card key={student.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <CardDescription>
                      {student.registration_number} • {student.class_name} {student.section_name}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t('balance')}</p>
                    <p className="text-xl font-bold text-destructive">
                      ETB {student.total_balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {student.fees.length > 0 ? (
                  <div className="space-y-2">
                    {student.fees.map((fee) => (
                      <div
                        key={fee.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{fee.fee_type}</span>
                            {getStatusBadge(fee.status)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {t('due')} {format(new Date(fee.due_date), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">ETB {fee.balance.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            of ETB {fee.amount.toLocaleString()}
                          </p>
                        </div>
                        {fee.status !== 'paid' && fee.balance > 0 && (
                          <Button
                            size="sm"
                            className="rounded-lg gap-2"
                            onClick={() => handlePayClick(student, fee.id)}
                          >
                            <CreditCard className="h-4 w-4" />
                            {t('payNow')}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>{t('noPendingFees')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('recentTransactions')}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recent_transactions?.length > 0 ? (
                <div className="space-y-2">
                  {data.recent_transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          tx.status === 'completed' 
                            ? 'bg-green-500/10' 
                            : tx.status === 'pending'
                            ? 'bg-amber-500/10'
                            : 'bg-red-500/10'
                        }`}>
                          {tx.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : tx.status === 'pending' ? (
                            <Clock className="h-5 w-5 text-amber-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.student_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {tx.payment_method} • {format(new Date(tx.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">ETB {tx.amount.toLocaleString()}</p>
                        <p className="text-xs font-mono text-muted-foreground">
                          Ref: {tx.reference_number}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-8 w-8 mx-auto mb-2" />
                  <p>{t('noTransactions')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Chapa Payment Modal */}
      {selectedStudent && selectedFeeId && (
        <ChapaPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedStudent(null);
            setSelectedFeeId(null);
          }}
          student={selectedStudent}
          feeId={selectedFeeId}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
