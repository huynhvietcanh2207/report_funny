<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'admin') {
            // Admin gets all projects
            $projects = Project::with('members')->orderBy('created_at', 'desc')->get();
            
            // Add is_member flag
            $projects->each(function($project) use ($user) {
                $project->is_member = $project->members->contains($user->id);
            });
        } else {
            // Normal user gets only their projects
            $projects = $user->projects()->with('members')->orderBy('created_at', 'desc')->get();
            $projects->each(function($project) {
                $project->is_member = true;
            });
        }

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
            'icon' => 'nullable|string',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        $project = Project::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? null,
            'icon' => $validated['icon'] ?? null,
        ]);

        // Attach creator as admin
        $project->members()->attach($request->user()->id, ['role' => 'admin']);

        // Attach other selected members as 'member'
        if (!empty($validated['user_ids'])) {
            $otherUserIds = array_diff($validated['user_ids'], [$request->user()->id]);
            if (!empty($otherUserIds)) {
                $project->members()->attach($otherUserIds, ['role' => 'member']);
            }
        }

        return response()->json($project->load('members'), 201);
    }

    public function show(Request $request, Project $project)
    {
        // Check membership
        if (!$project->members->contains($request->user()->id)) {
            return response()->json(['message' => 'Bạn không phải là thành viên của dự án này.'], 403);
        }

        return response()->json($project->load(['members', 'weeklyVoices']));
    }

    public function update(Request $request, Project $project)
    {
        // Check membership
        if (!$project->members->contains($request->user()->id)) {
            return response()->json(['message' => 'Bạn không có quyền chỉnh sửa dự án này.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
            'icon' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $project->update($validated);
        return response()->json($project);
    }

    public function addMembers(Request $request, Project $project)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        // Sync without detaching: adds new ones, keeps existing ones
        $project->members()->syncWithoutDetaching($validated['user_ids']);

        return response()->json($project->load('members'));
    }

    public function removeMember(Request $request, Project $project, $userId)
    {
        // Don't allow removing themselves (safety)
        if ($request->user()->id == $userId) {
            return response()->json(['message' => 'Bạn không thể tự xóa mình khỏi dự án.'], 422);
        }

        $project->members()->detach($userId);
        return response()->json(['message' => 'Đã xóa thành viên khỏi dự án.']);
    }

    public function destroy(Request $request, Project $project)
    {
        // Check membership
        if (!$project->members->contains($request->user()->id)) {
            return response()->json(['message' => 'Bạn không có quyền xóa dự án này.'], 403);
        }

        // Check if project has any data
        if ($project->weeklyVoices()->count() > 0) {
            return response()->json([
                'message' => 'Không thể xóa dự án vì đã có dữ liệu báo cáo. Vui lòng xóa các bản ghi âm trong dự án trước.'
            ], 422);
        }

        $project->delete();
        return response()->json(null, 204);
    }
}
