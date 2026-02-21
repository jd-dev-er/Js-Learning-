const workflowService = require('../services/workflow.service' );
exports.triggerWorkflow = async (req, res) => {
  try {
    const { workflowName, params } = req.body;
    const result = await workflowService.triggerWorkflow( workflowName, params);
    res.json({ message: 'Workflow triggered', result  });
  } catch (err) {
    res.status(400).json({ error: err.message  });
  }
};