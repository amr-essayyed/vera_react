# Add this to your Odoo product.template model
# This is Python code for Odoo, not for your React app

from odoo import models, fields, api

class ProductTemplate(models.Model):
    _inherit = 'product.template'
    
    @api.depends('id')
    def _compute_image_url(self):
        """Compute the image URL for the product"""
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        for record in self:
            if record.id:
                record.image_url = f"{base_url}/web/image/product.template/{record.id}/image_1920"
            else:
                record.image_url = False
    
    image_url = fields.Char(string='Image URL', compute='_compute_image_url', store=False)