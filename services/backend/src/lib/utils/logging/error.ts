export function logError() {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;

        descriptor.value = async function() {
            try {
                return await method.apply(this, arguments);
            } catch (err) {
                if (this.logger) {
                    this.logger.error(err);
                }
                throw err;
            }
        }
    }
}
