'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Building2, DoorOpen, Edit, Trash2 } from 'lucide-react';
import { useBuildings, useDeleteBuilding, useDeleteClassroom } from '@/features/academics/api/useInfrastructure';
import { BuildingModal } from '@/features/academics/components/BuildingModal';
import { ClassroomModal } from '@/features/academics/components/ClassroomModal';
import { type BuildingForm, type ClassroomForm } from '@/features/academics/types/schemas';
import { toast } from 'sonner';

export default function InfrastructurePage() {
  const t = useTranslations('common');
  const ta = useTranslations('academics');
  const [activeTab, setActiveTab] = useState('buildings');
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [classroomModalOpen, setClassroomModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null);

  const { data: buildingsData, isLoading: isLoadingBuildings } = useBuildings(1, 50);
  const deleteBuildingMutation = useDeleteBuilding();
  const deleteClassroomMutation = useDeleteClassroom();

  const handleCreateBuilding = (data: BuildingForm) => {
    toast.success('Building created (implement with useCreateBuilding)');
    setBuildingModalOpen(false);
  };

  const handleCreateClassroom = (data: ClassroomForm) => {
    toast.success('Classroom created (implement with useCreateClassroom)');
    setClassroomModalOpen(false);
  };

  const filteredBuildings = buildingsData?.items?.filter((b: any) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={ta('infrastructure') || 'Infrastructure'}
        description="Manage school buildings and classrooms"
        actions={
          activeTab === 'buildings' ? (
            <Button onClick={() => setBuildingModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Building
            </Button>
          ) : (
            <Button onClick={() => setClassroomModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Classroom
            </Button>
          )
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="buildings" className="gap-2">
            <Building2 className="h-4 w-4" />
            Buildings
          </TabsTrigger>
          <TabsTrigger value="classrooms" className="gap-2">
            <DoorOpen className="h-4 w-4" />
            Classrooms
          </TabsTrigger>
        </TabsList>

        {/* Buildings Tab */}
        <TabsContent value="buildings" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search buildings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Classrooms</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingBuildings ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredBuildings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No buildings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBuildings.map((building: any) => (
                    <TableRow key={building.id}>
                      <TableCell className="font-medium">{building.name}</TableCell>
                      <TableCell>{building.code || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {building.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {building.classroom_count || 0} rooms
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBuildingMutation.mutate(building.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Classrooms Tab */}
        <TabsContent value="classrooms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuildings.map((building: any) => (
              <Card key={building.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{building.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {building.classroom_count || 0} classrooms
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBuilding(building);
                      setClassroomModalOpen(true);
                    }}
                  >
                    View Rooms
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <BuildingModal
        open={buildingModalOpen}
        onOpenChange={setBuildingModalOpen}
        onSubmit={handleCreateBuilding}
      />

      <ClassroomModal
        open={classroomModalOpen}
        onOpenChange={setClassroomModalOpen}
        building={selectedBuilding}
        onSubmit={handleCreateClassroom}
      />
    </div>
  );
}
