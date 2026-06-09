import axios from 'axios'

/**
 * Service to handle generic external API requests, including AI capabilities.
 */

const AI_API_TOKEN = 'sk-nsEMO5Wu-6y4522yoSn5NQ'

// Buat Axios Instance
const aiInstance = axios.create({
  baseURL: 'https://api.biznetgio.ai/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AI_API_TOKEN}`
  }
})

class ApiService {
  /**
   * Generates business insight from AI based on the given prompt.
   * @param {string} promptContent - The data/prompt to send to the AI.
   * @returns {Promise<string>} The generated insight text.
   */
  async generateBusinessInsight(promptContent) {
    try {
      const response = await aiInstance.post('/chat/completions', {
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'user',
            content: promptContent
          }
        ]
      })

      if (response.data?.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content
      } else {
        throw new Error('No valid response from AI.')
      }
    } catch (error) {
      console.error('generateBusinessInsight error:', error)
      throw error
    }
  }

  /**
   * Send a full conversation array to the AI.
   * @param {Array<{role: string, content: string}>} messages
   */
  async askAssistant(messages) {
    try {
      const response = await aiInstance.post('/chat/completions', {
        model: 'openai/gpt-oss-20b',
        messages
      })

      if (response.data?.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content
      } else {
        throw new Error('No valid response from AI.')
      }
    } catch (error) {
      console.error('askAssistant error:', error)
      throw error
    }
  }

  /**
   * Send a report for inappropriate AI content.
   * @param {Object} payload - The report data { message, reason, timestamp }
   */
  async reportAiResponse(payload) {
    try {
      const response = await axios.post('https://api.muhammadsyahputra.my.id/api/v1/ldesktop/report', payload, {
        headers: { 'Content-Type': 'application/json' }
      })
      return response.data
    } catch (error) {
      console.error('reportAiResponse error:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()
