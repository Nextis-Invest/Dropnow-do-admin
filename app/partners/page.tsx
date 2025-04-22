"use client";

import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PartnersDataTable } from "@/components/partners/partners-data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PartnerType, PartnerStatus } from "@prisma/client";

// Define the Partner interface
export interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  logoUrl?: string;
  type: PartnerType;
  status: PartnerStatus;
  notes?: string;
  balance: number;
  ratePerKm?: number;
  ratePerHour?: number;
  minimumFare?: number;
  commissionRate?: number;
  paymentTerms?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  taxId?: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    vehicles: number;
    eventParticipations: number;
    missionPartners: number;
    ridePartners: number;
  };
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch partners data
  const fetchPartners = async (filter?: string) => {
    setLoading(true);
    try {
      let url = "/api/partners";
      if (filter && filter !== "all") {
        url += `?status=${filter.toUpperCase()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch partners");
      }

      const data = await response.json();
      setPartners(data);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPartners(activeTab);
  }, [activeTab]);

  // Filter partners based on active tab
  const filteredPartners = partners.filter((partner) => {
    if (activeTab === "all") return true;
    return partner.status.toLowerCase() === activeTab.toLowerCase();
  });

  // Stats for the dashboard cards
  const stats = {
    total: partners.length,
    active: partners.filter((p) => p.status === "ACTIVE").length,
    inactive: partners.filter((p) => p.status === "INACTIVE").length,
    pending: partners.filter((p) => p.status === "PENDING").length,
    suspended: partners.filter((p) => p.status === "SUSPENDED").length,
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Partners
                    </h1>
                    <p className="text-muted-foreground">
                      Manage your partner companies and service providers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Partner
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Partners
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Partners
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.active}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Partners
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pending}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Inactive/Suspended
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.inactive + stats.suspended}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Partners Table */}
              <div className="px-4 lg:px-6">
                <Tabs
                  defaultValue="all"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="all">All Partners</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="all" className="mt-4">
                    <PartnersDataTable
                      data={filteredPartners}
                      loading={loading}
                      onRefresh={() => fetchPartners(activeTab)}
                    />
                  </TabsContent>
                  <TabsContent value="active" className="mt-4">
                    <PartnersDataTable
                      data={filteredPartners}
                      loading={loading}
                      onRefresh={() => fetchPartners(activeTab)}
                    />
                  </TabsContent>
                  <TabsContent value="pending" className="mt-4">
                    <PartnersDataTable
                      data={filteredPartners}
                      loading={loading}
                      onRefresh={() => fetchPartners(activeTab)}
                    />
                  </TabsContent>
                  <TabsContent value="inactive" className="mt-4">
                    <PartnersDataTable
                      data={filteredPartners}
                      loading={loading}
                      onRefresh={() => fetchPartners(activeTab)}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
