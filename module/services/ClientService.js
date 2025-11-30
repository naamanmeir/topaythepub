/**
 * Client Service
 * Business logic for client operations
 */

const ClientRepository = require('../database/ClientRepository');
const Client = require('../models/Client');

class ClientService {
    constructor(pool) {
        this.clientRepo = new ClientRepository(pool);
    }

    /**
     * Get client by ID
     * @param {number} id - Client ID
     * @returns {Client|null}
     * @throws {Error} If client not found
     */
    async getClientById(id) {
        const client = await this.clientRepo.findById(id);
        if (!client) {
            throw new Error('CLIENT_NOT_FOUND');
        }
        return client;
    }

    /**
     * Search clients by nickname or name
     * @param {string} query - Search query
     * @returns {Array<Client>}
     */
    async searchClients(query) {
        // Try exact nickname match first
        let clients = await this.clientRepo.findByNickExact(query);
        
        // If no exact match, try partial nickname match
        if (clients.length === 0) {
            clients = await this.clientRepo.findByNick(query);
        }
        
        // If still no match, try name search
        if (clients.length === 0) {
            clients = await this.clientRepo.findByName(query);
        }
        
        return clients;
    }

    /**
     * Get client with order history
     * @param {number} id - Client ID
     * @returns {Object} Client with orders
     * @throws {Error} If client not found
     */
    async getClientWithOrders(id) {
        const clientWithOrders = await this.clientRepo.getWithOrders(id);
        if (!clientWithOrders) {
            throw new Error('CLIENT_NOT_FOUND');
        }
        return clientWithOrders;
    }

    /**
     * Create new client
     * @param {Object} clientData - {name, nick, account}
     * @returns {number} New client ID
     * @throws {Error} If validation fails or client already exists
     */
    async createClient(clientData) {
        // Validate client data
        const client = new Client(clientData);
        const validation = client.validate();
        
        if (!validation.valid) {
            throw new Error(`VALIDATION_FAILED: ${validation.errors.join(', ')}`);
        }

        // Check for duplicates
        if (await this.clientRepo.existsByName(clientData.name)) {
            throw new Error('CLIENT_EXISTS_BY_NAME');
        }

        if (await this.clientRepo.existsByNick(clientData.nick)) {
            throw new Error('CLIENT_EXISTS_BY_NICK');
        }

        if (clientData.account && await this.clientRepo.existsByAccount(clientData.account)) {
            throw new Error('CLIENT_EXISTS_BY_ACCOUNT');
        }

        // Create client
        return await this.clientRepo.create(clientData);
    }

    /**
     * Update client nickname
     * @param {number} id - Client ID
     * @param {string} newNick - New nickname
     * @throws {Error} If client not found or nickname taken
     */
    async updateNickname(id, newNick) {
        // Check if client exists
        const client = await this.getClientById(id);

        // Check if nickname is already taken (by another client)
        const existingClients = await this.clientRepo.findByNickExact(newNick);
        if (existingClients.length > 0 && existingClients[0].id !== id) {
            throw new Error('NICKNAME_TAKEN');
        }

        await this.clientRepo.update(id, 'nick', newNick);
    }

    /**
     * Update client field
     * @param {number} id - Client ID
     * @param {string} field - Field name
     * @param {*} value - New value
     * @throws {Error} If client not found or validation fails
     */
    async updateClient(id, field, value) {
        // Check if client exists
        await this.getClientById(id);

        // Validate field
        const allowedFields = ['name', 'nick', 'account'];
        if (!allowedFields.includes(field)) {
            throw new Error('INVALID_FIELD');
        }

        // Additional validation for specific fields
        if (field === 'nick' && await this.clientRepo.existsByNick(value)) {
            throw new Error('NICKNAME_TAKEN');
        }

        if (field === 'account' && await this.clientRepo.existsByAccount(value)) {
            throw new Error('ACCOUNT_TAKEN');
        }

        await this.clientRepo.update(id, field, value);
    }

    /**
     * Delete client
     * @param {number} id - Client ID
     * @throws {Error} If client not found
     */
    async deleteClient(id) {
        // Check if client exists
        await this.getClientById(id);
        
        // TODO: Consider checking if client has outstanding balance
        // and whether to allow deletion
        
        await this.clientRepo.delete(id);
    }

    /**
     * Get all clients
     * @returns {Array<Client>}
     */
    async getAllClients() {
        return await this.clientRepo.findAll();
    }

    /**
     * Reset all client balances (for end of period)
     * Should be called with caution, usually by accountant
     */
    async resetAllBalances() {
        await this.clientRepo.resetAllBalances();
    }

    /**
     * Get client statistics
     * @returns {Object} Statistics
     */
    async getStatistics() {
        const totalClients = await this.clientRepo.count();
        const allClients = await this.clientRepo.findAll();
        
        const totalDebt = allClients.reduce((sum, client) => sum + client.sum, 0);
        const clientsWithDebt = allClients.filter(client => client.sum > 0).length;
        
        return {
            totalClients,
            clientsWithDebt,
            totalDebt,
            averageDebt: clientsWithDebt > 0 ? totalDebt / clientsWithDebt : 0
        };
    }
}

module.exports = ClientService;
