"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, Check, X, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface Agent {
  hostname: string;
  ip: string;
}

export default function AgentApproval() {
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  const SERVER_URL = "http://localhost:8123"; // Update when deployed

  // Function to fetch pending agents
  const fetchPendingAgents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/pending`);
      if (response.ok) {
        const data = await response.json();
        // Convert the returned object into an array
        const agents = Object.entries(data).map(([hostname, ip]) => ({
          hostname,
          ip: ip as string,
        }));
        setPendingAgents(agents);
      } else {
        throw new Error("Failed to fetch pending agents");
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load pending agents.");
    }
    setLoading(false);
  }, [SERVER_URL]);

  // Approve an agent
  const approveAgent = async (hostname: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === "approved" || data.status === "already_approved") {
          toast.success(`Approved: ${hostname}`);
          setPendingAgents((prev) =>
            prev.filter((agent) => agent.hostname !== hostname)
          );
        } else {
          toast.error(`Approval failed for ${hostname}`);
        }
      } else {
        const err = await response.json();
        toast.error(`Error: ${err.detail}`);
      }
    } catch (error) {
      console.error("Error approving agent:", error);
      toast.error("Approval failed.");
    }
  };

  // Reject an agent
  const rejectAgent = async (hostname: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname }),
      });
      if (response.ok) {
        toast.success(`Rejected: ${hostname}`);
        setPendingAgents((prev) =>
          prev.filter((agent) => agent.hostname !== hostname)
        );
      } else {
        const err = await response.json();
        toast.error(`Error: ${err.detail}`);
      }
    } catch (error) {
      console.error("Error rejecting agent:", error);
      toast.error("Rejection failed.");
    }
  };

  // Poll for pending agents every 10 seconds
  useEffect(() => {
    fetchPendingAgents();
    const interval = setInterval(fetchPendingAgents, 10000);
    return () => clearInterval(interval);
  }, [fetchPendingAgents]);

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Pending Agent Approvals</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchPendingAgents}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader className="animate-spin h-6 w-6 text-gray-500" />
            </div>
          ) : pendingAgents.length > 0 ? (
            <ul className="space-y-4">
              {pendingAgents.map((agent) => (
                <li
                  key={agent.hostname}
                  className="flex justify-between items-center p-4 border rounded-md"
                >
                  <div>
                    <p className="font-semibold">{agent.hostname}</p>
                    <p className="text-sm text-gray-500">{agent.ip}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => approveAgent(agent.hostname)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => rejectAgent(agent.hostname)}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No pending agents.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
