import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft, Mail, Phone, User } from "lucide-react";
import Link from "next/link";

export default async function UserDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      client: true,
      chauffeurProfile: true,
    },
  });

  if (!user) {
    notFound();
  }

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-4">
                  <Link href="/users">
                    <Button variant="ghost" size="icon">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      {fullName}
                    </h1>
                    <p className="text-muted-foreground">
                      User details and connection options
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 px-4 lg:px-6 lg:grid-cols-2">
                {/* User Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>
                      Basic information about the user
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Name:</span>
                      <span>{fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span>{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Role:</span>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    {user.client && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Client:</span>
                        <span>{user.client.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>
                      More details about this user
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user.chauffeurProfile && (
                      <div>
                        <h3 className="font-medium mb-2">Chauffeur Profile</h3>
                        <div className="text-sm text-muted-foreground">
                          <p>This user has a chauffeur profile.</p>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Note: Internal users do not need QR code connections. QR
                      code connections are only for external drivers.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
