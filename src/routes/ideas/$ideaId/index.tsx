import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  queryOptions,
  useSuspenseQuery,
  useMutation,
} from "@tanstack/react-query";
import { fetchIdea, deleteIdea } from "@/api/ideas";

const ideaQueryOptions = (ideaId: string) =>
  queryOptions({
    queryKey: ["idea", ideaId],
    queryFn: () => fetchIdea(ideaId),
  });

export const Route = createFileRoute("/ideas/$ideaId/")({
  component: IdeaDetailPage,
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData(ideaQueryOptions(params.ideaId));
  },
});

function IdeaDetailPage() {
  const { ideaId } = Route.useParams();
  const { data: idea } = useSuspenseQuery(ideaQueryOptions(ideaId));

  const navigate = useNavigate();

  const { mutateAsync: deleteMutateAsync, isPending } = useMutation({
    mutationFn: () => deleteIdea(ideaId),
    onSuccess: () => {
      navigate({ to: "/ideas" });
    },
  });

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this idea?")) {
      try {
        await deleteMutateAsync();
      } catch (error) {
        console.error(error);
        alert("Something went wrong");
      }
    }
  };

  return (
    <div className="p-4">
      <Link to="/ideas" className="text-blue-500 underline block mb-4">
        Back to Ideas
      </Link>
      <h2 className="text-2xl font-bold">{idea.title}</h2>
      <p className="mt-2">{idea.description}</p>

      {/* Edit Link */}
      <Link
        to="/ideas/$ideaId/edit"
        params={{ ideaId: idea._id.toString() }}
        className="text-sm bg-green-500 text-white mt-4 px-4 py-2 mr-2 rounded inline-block hover:bg-green-600 transition"
      >
        Edit
      </Link>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm bg-red-600 text-white mt-4 px-4 py-2 rounded transition disabled:opacity:50"
      >
        {isPending ? "Deleting..." : "Delete Idea"}
      </button>
    </div>
  );
}
