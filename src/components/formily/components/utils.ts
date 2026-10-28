export const getDisableReactions = column => {
  const disableReactions: any[] = [];

  if (column.disableLogic?.question) {
    const disableItem = column.disableLogic.question;
    disableReactions.push({
      dependencies: [`.${disableItem.path}`],
      fulfill: {
        schema: {
          'x-component-props': {
            disabled: `{{typeof($deps[0]) === 'string' ? ${JSON.stringify(
              disableItem.value,
            )}?.includes($deps[0]) : ${JSON.stringify(
              disableItem.value,
            )}?.some(item => $deps[0]?.includes(item))}}`,
          },
        },
      },
    });
  }
  return disableReactions;
};
