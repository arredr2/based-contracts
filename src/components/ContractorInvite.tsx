import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2, Copy, CheckCircle } from 'lucide-react';

interface Invitation {
  id: string;
  email: string;
  projectDetails: string;
  status: 'pending' | 'accepted' | 'expired';
  inviteLink: string;
  createdAt: number;
}

export default function ContractorInvite() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateInviteLink = async () => {
    if (!email || !projectDetails) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          projectDetails,
          clientAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invite');
      }

      const data = await response.json();
      
      const newInvitation: Invitation = {
        id: data.id,
        email,
        projectDetails,
        status: 'pending',
        inviteLink: data.inviteLink,
        createdAt: Date.now(),
      };

      setInvitations(prev => [newInvitation, ...prev]);
      
      // Send email notification
      await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          inviteLink: data.inviteLink,
          projectDetails,
        }),
      });

      toast({
        title: 'Invitation Created',
        description: 'Invitation has been sent to the contractor',
      });

      // Reset form
      setEmail('');
      setProjectDetails('');
    } catch (error) {
      console.error('Invitation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const resendInvitation = async (invitation: Invitation) => {
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: invitation.email,
          inviteLink: invitation.inviteLink,
          projectDetails: invitation.projectDetails,
          isResend: true,
        }),
      });

      toast({
        title: 'Invitation Resent',
        description: 'Invitation has been resent to the contractor',
      });
    } catch (error) {
      console.error('Resend error:', error);
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Contractor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Contractor Email</label>
              <Input
                type="email"
                placeholder="contractor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Project Details</label>
              <Input
                placeholder="Brief project description"
                value={projectDetails}
                onChange={(e) => setProjectDetails(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={generateInviteLink}
              disabled={isLoading || !email || !projectDetails}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Link...
                </>
              ) : (
                'Generate Invite Link'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {invitation.projectDetails}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${invitation.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                      ${invitation.status === 'expired' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(invitation.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(invitation.inviteLink, invitation.id)}
                      >
                        {copiedId === invitation.id ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      {invitation.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendInvitation(invitation)}
                        >
                          Resend
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {invitations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No invitations yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
