const errorService = require('../services/errorService');

class ErrorController {
  async getErrors(req, res) {
    try {
      const errors = await errorService.getAllErrors();
      res.json(errors);
    } catch (error) {
      console.error('Error in getErrors:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async getFormTypes(req, res) {
    try {
      const formTypes = await errorService.getFormTypes();
      res.json(formTypes);
    } catch (error) {
      console.error('Error in getFormTypes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ErrorController();