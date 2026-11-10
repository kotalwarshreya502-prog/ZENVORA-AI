import Storage from '../services/storageService.js';
import { errorResponse, successResponse } from '../utils/responseHandler.js';

export const getBlogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const blogs = await Storage.getBlogs(userId);
    return successResponse(res, 'Blogs fetched', { blogs });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch blogs', 500, err.message);
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Storage.getBlogById(id);
    if (!blog) {
      return errorResponse(res, 'Blog not found', 404);
    }
    return successResponse(res, 'Blog fetched', { blog });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch blog', 500, err.message);
  }
};

export const createBlog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, topic, targetKeyword, secondaryKeywords, seoTitle, metaDescription, content, outline, faqs, status, readingTime, seoScore } = req.body;

    if (!title || !content) {
      return errorResponse(res, 'Title and content are required', 400);
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const blog = await Storage.createBlog(userId, {
      title,
      slug,
      topic: topic || '',
      targetKeyword: targetKeyword || '',
      secondaryKeywords: secondaryKeywords || [],
      seoTitle: seoTitle || title,
      metaDescription: metaDescription || '',
      content,
      outline: outline || [],
      faqs: faqs || [],
      status: status || 'Draft',
      readingTime: readingTime || 5,
      seoScore: seoScore || 88,
    });

    return successResponse(res, 'Blog created successfully', { blog }, 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create blog', 500, err.message);
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Storage.updateBlog(id, req.body);
    return successResponse(res, 'Blog updated', { blog: updated });
  } catch (err) {
    return errorResponse(res, 'Failed to update blog', 500, err.message);
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    await Storage.deleteBlog(id);
    return successResponse(res, 'Blog deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete blog', 500, err.message);
  }
};
