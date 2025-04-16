import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import Link from "next/link";

export default async function UsersPage() {
  // Fetch internal users from the database
  const internalUsers = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      client: true,
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
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                </div>
                <p className="text-muted-foreground">
                  Manage all users and their permissions
                </p>
              </div>

              <div className="px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {internalUsers.map((user) => (
                    <Card key={user.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {user.firstName} {user.lastName}
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Role:</span>
                            <Badge variant="outline">{user.role}</Badge>
                          </div>
                          {user.client && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                Client:
                              </span>
                              <span className="text-sm">
                                {user.client.name}
                              </span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                Phone:
                              </span>
                              <span className="text-sm">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Link href={`/users/${user.id}`}>
                          <Button variant="outline" size="sm">
                            <User className="mr-2 h-4 w-4" />
                            Details
                          </Button>
                        </Link>
                        <Link href={`/users/${user.id}`}>
                          <Button variant="outline" size="sm">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
