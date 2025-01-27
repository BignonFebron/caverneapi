// utils/orderUtils.js
const getCurrentWeekRange = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Lundi
    const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7)); // Dimanche

    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    return `${formatDate(firstDayOfWeek)}-${formatDate(lastDayOfWeek)}`;
};

const getNextLotNumber = async () => {
    const currentWeekRange = getCurrentWeekRange();
    const lastOrder = await Order.findOne({ lotWeek: currentWeekRange }).sort({ lotNumber: -1 });
    return lastOrder ? lastOrder.lotNumber + 1 : 1;
};

const getNextCommandNumber = async () => {
    const lastOrder = await Order.findOne().sort({ commandNumber: -1 });
    return lastOrder ? lastOrder.commandNumber + 1 : 1;
};

module.exports = { getCurrentWeekRange, getNextLotNumber, getNextCommandNumber };