

export default {
    selectDate(context: any, payload: any) {
        context.commit('selectDate', payload);
    },
    resetDates(context: any) {
        context.commit('resetDates');
    }
};