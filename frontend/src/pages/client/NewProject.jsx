import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const NewProject = () => {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!description.trim()) {
      toast.error('Please enter a project description');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      // Mocking AI response as instructed or expecting backend to have this route
      const res = await api.post('/ai/analyze-project', { description });
      setAiResult(res.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze project. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateProject = async () => {
    setIsCreating(true);
    try {
      const res = await api.post('/projects', {
        name: aiResult.name || 'New Project',
        description,
        requirements: aiResult.requirements,
        technologies: aiResult.technologies,
      });
      toast.success('Project created successfully!');
      navigate(`/client/projects/${res.data.id}`);
    } catch (error) {
      toast.error('Failed to create project.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        <p className="mt-1 text-sm text-gray-500">
          Describe what you want to build, and our AI will extract requirements and recommend a tech stack.
        </p>
      </div>

      {!aiResult ? (
        <Card>
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Project Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={8}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border"
                  placeholder="Describe your project in plain English... e.g. I want to build a marketplace for local farmers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAnalyze} isLoading={isAnalyzing}>
                Analyze Requirements
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in-up">
          <Card title="AI Analysis Results" subtitle="Review and approve the extracted requirements.">
            <div className="space-y-6">
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Suggested Name</h4>
                <p className="mt-1 text-lg font-semibold text-indigo-600">{aiResult.name}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-2">Complexity & Timeline</h4>
                <div className="flex gap-4">
                  <Badge variant="info">Complexity: {aiResult.estimated_complexity}</Badge>
                  <Badge variant="gray">Est. Duration: {aiResult.estimated_duration}</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-2">Core Requirements</h4>
                <ul className="space-y-2">
                  {aiResult.requirements?.map((req, idx) => (
                    <li key={idx} className="flex items-start">
                      <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                      <span className="ml-3 text-sm text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-2">Recommended Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {aiResult.technologies?.map((tech, idx) => (
                    <Badge key={idx} variant="indigo">{tech}</Badge>
                  ))}
                </div>
              </div>

              {aiResult.questions_for_client?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">Questions to Consider</h4>
                  <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
                    {aiResult.questions_for_client.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
            
            <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setAiResult(null)}>Edit Description</Button>
              <Button onClick={handleCreateProject} isLoading={isCreating}>
                Create Project with Approved Requirements
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NewProject;
