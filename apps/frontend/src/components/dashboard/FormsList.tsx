import { useState } from "react";
import { Link } from "wouter";
import { useFormContext } from "@context/FormContext";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import { Badge } from "@ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import {
  Edit,
  Eye,
  MoreHorizontal,
  PlusCircle,
  Share2,
  Trash2,
} from "lucide-react";

interface Form {
  id: number;
  title: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  responseCount: number;
}

type FormContextValue = {
  forms: Form[];
  deleteForm: (id: number) => Promise<void>;
  isLoading: boolean;
}

const defaultValue: FormContextValue = {
  forms: [],
  deleteForm: async () => {},
  isLoading: false,
};

function FormsList() {
  const context = useFormContext() as unknown as FormContextValue;
  const { forms, deleteForm, isLoading } = context;
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);

  const handleDeleteClick = (form: Form) => {
    setFormToDelete(form);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (formToDelete) {
      await deleteForm(formToDelete.id);
      setShowConfirmDelete(false);
      setFormToDelete(null);
    }
  };

  const getStatusBadge = (status: Form['status']) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Draft
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Content>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Forms</h2>
        <Link href="/forms/new">
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Form
          </Button>
        </Link>
      </div>

      <Card>
        {Array.isArray(forms) && forms.length === 0 ? (
          <Card.Content>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't created any forms yet</p>
              <Link href="/forms/new">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create your first form
                </Button>
              </Link>
            </div>
          </Card.Content>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Form Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(forms ?? []).map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.title}</TableCell>
                  <TableCell>{formatDate(form.createdAt)}</TableCell>
                  <TableCell>{form.responseCount || 0}</TableCell>
                  <TableCell>{getStatusBadge(form.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/forms/edit/${form.id}`}>
                            <div className="flex items-center">
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/forms/${form.id}/responses`}>
                            <div className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Responses</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <div className="flex items-center">
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share Form</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(form)}>
                          <div className="flex items-center text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <span className="font-medium">{formToDelete?.title}</span>? This action
              cannot be undone and all responses will be lost.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormsList;
