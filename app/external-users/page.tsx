import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ExternalUserConnectionQR } from "./components/external-user-connection-qr";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QrCode, RefreshCw, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function ExternalUsersPage() {
  // Fetch recently connected external users
  const recentUsers = await prisma.driver.findMany({
    where: {
      lastConnected: {
        not: null,
      },
    },
    orderBy: {
      lastConnected: "desc",
    },
    take: 5,
    include: {
      mobileDevices: {
        orderBy: {
          lastActive: "desc",
        },
        take: 1,
      },
    },
  });

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-2xl font-bold tracking-tight">
                  External Users
                </h1>
                <p className="text-muted-foreground">
                  Connect external users to the mobile app
                </p>
              </div>

              <div className="grid gap-4 px-4 lg:px-6 lg:grid-cols-2">
                {/* QR Code Generator */}
                <div>
                  <ExternalUserConnectionQR />
                </div>

                {/* Recent Connections */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Connections</CardTitle>
                      <CardDescription>
                        External users who recently connected to the mobile app
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recentUsers.length > 0 ? (
                        <div className="space-y-4">
                          {recentUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-start space-x-4 border-b pb-4 last:border-0"
                            >
                              <div className="bg-primary/10 p-2 rounded-full">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-medium">
                                  {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : `User ${user.externalId}`}
                                </p>
                                {user.email && (
                                  <p className="text-sm text-muted-foreground">
                                    {user.email}
                                  </p>
                                )}
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <RefreshCw className="mr-1 h-3 w-3" />
                                  Connected{" "}
                                  {user.lastConnected
                                    ? formatDistanceToNow(user.lastConnected, {
                                        addSuffix: true,
                                      })
                                    : "never"}
                                </div>
                                {user.mobileDevices.length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">Device:</span>{" "}
                                    {user.mobileDevices[0].deviceName ||
                                      user.mobileDevices[0].deviceModel ||
                                      "Unknown device"}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <QrCode className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          <p>No external users have connected yet</p>
                          <p className="text-sm">
                            Generate a QR code to get started
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
