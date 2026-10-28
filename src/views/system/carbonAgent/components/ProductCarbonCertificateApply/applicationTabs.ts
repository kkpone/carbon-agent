import type {
  ProductCarbonCertificateApplication,
  ProductCarbonCertificateTargetFields,
} from './types';

export type ProductCarbonCertificateSourceTarget =
  ProductCarbonCertificateTargetFields & {
    accountId?: string;
    accountName?: string;
    messageId?: string;
    productId?: string;
    productName?: string;
    type?: string;
  };

type ProductCarbonCertificateTarget = ProductCarbonCertificateSourceTarget & {
  type: 'productCarbonCertificate';
};

const PRODUCT_CARBON_CERTIFICATE_SOURCE_TYPES = new Set([
  'account',
  'report',
  'expertReview',
  'certification',
  'carbonLabel',
  'productCarbonCertificate',
]);

export function getProductCarbonCertificateTabKey(
  target: ProductCarbonCertificateSourceTarget,
) {
  const accountId = String(target.accountId || 'unknown');
  const applicationIdentity =
    target.productCarbonCertificateApplicationId ||
    target.productCarbonCertificateTemporaryKey ||
    'draft';

  return `productCarbonCertificate:${encodeURIComponent(
    accountId,
  )}:${encodeURIComponent(applicationIdentity)}` as const;
}

export function getProductCarbonCertificateAccountIdsKey(
  targets: ProductCarbonCertificateSourceTarget[],
) {
  return Array.from(
    new Set(
      targets
        .filter(
          target =>
            target.accountId &&
            PRODUCT_CARBON_CERTIFICATE_SOURCE_TYPES.has(
              target.type || 'account',
            ),
        )
        .map(target => String(target.accountId)),
    ),
  ).join('|');
}

export function mergeProductCarbonCertificateApplicationTargets<
  Target extends ProductCarbonCertificateSourceTarget,
>(
  targets: Target[],
  applications: ProductCarbonCertificateApplication[],
): Array<Target | ProductCarbonCertificateTarget> {
  const applicationByIdentity = new Map(
    applications.map(application => [
      `${application.accountId}:${application.id}`,
      application,
    ]),
  );
  const openedIdentities = new Set<string>();
  const result: Array<Target | ProductCarbonCertificateTarget> = targets.map(
    target => {
      if (
        target.type !== 'productCarbonCertificate' ||
        !target.productCarbonCertificateApplicationId
      ) {
        return target;
      }

      const identity = `${target.accountId}:${target.productCarbonCertificateApplicationId}`;
      const application = applicationByIdentity.get(identity);
      openedIdentities.add(identity);

      return application
        ? {
            ...target,
            productCarbonCertificatePrepared: application,
            productCarbonCertificateStatus:
              target.productCarbonCertificateStatus ||
              application.status ||
              undefined,
            productCarbonCertificateStatusName:
              target.productCarbonCertificateStatusName ||
              application.statusName ||
              undefined,
          }
        : target;
    },
  );

  applications.forEach(application => {
    const identity = `${application.accountId}:${application.id}`;

    if (openedIdentities.has(identity)) {
      return;
    }

    openedIdentities.add(identity);
    result.push({
      accountId: String(application.accountId),
      productName: application.productName,
      productCarbonCertificateApplicationId: String(application.id),
      productCarbonCertificatePrepared: application,
      productCarbonCertificateStatus: application.status || undefined,
      productCarbonCertificateStatusName: application.statusName || undefined,
      type: 'productCarbonCertificate',
    });
  });

  return result;
}
