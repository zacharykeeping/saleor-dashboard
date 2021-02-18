import faker from "faker";

import ProductSteps from "../../steps/productSteps";
import { URL_LIST } from "../../url/url-list";
import ChannelsUtils from "../../utils/channelsUtils";
import FrontShopProductUtils from "../../utils/frontShop/frontShopProductUtils";
import ProductsUtils from "../../utils/productsUtils";

// <reference types="cypress" />
describe("Publish products", () => {
  const channelsUtils = new ChannelsUtils();
  const productsUtils = new ProductsUtils();
  const productSteps = new ProductSteps();
  const frontShopProductUtils = new FrontShopProductUtils();

  const startsWith = "Cy-";
  const name = `${startsWith}${faker.random.number()}`;
  let productType;
  let attribute;
  let category;

  before(() => {
    cy.clearSessionData().loginUserViaRequest();
    productsUtils.deleteProperProducts(startsWith);
    productsUtils.createTypeAttributeAndCategoryForProduct(name).then(() => {
      productType = productsUtils.getProductType();
      attribute = productsUtils.getAttribute();
      category = productsUtils.getCategory();
    });
  });

  beforeEach(() => {
    cy.clearSessionData().loginUserViaRequest();
  });
  it("should update product to published", () => {
    const productName = `${startsWith}${faker.random.number()}`;
    channelsUtils.getDefaultChannel().then(defaultChannel => {
      productsUtils
        .createProductInChannel(
          productName,
          defaultChannel.id,
          null,
          null,
          productType.id,
          attribute.id,
          category.id,
          null,
          false,
          false,
          true
        )
        .then(() => {
          const product = productsUtils.getCreatedProduct();
          const productUrl = `${URL_LIST.products}${product.id}`;
          productSteps.updateProductPublish(productUrl, true);
          frontShopProductUtils
            .isProductVisible(product.id, defaultChannel.slug, productName)
            .then(isVisible => {
              expect(isVisible).to.be.eq(true);
            });
        });
    });
  });
  it("should update product to not published", () => {
    const productName = `${startsWith}${faker.random.number()}`;
    channelsUtils.getDefaultChannel().then(defaultChannel => {
      productsUtils
        .createProductInChannel(
          productName,
          productType.id,
          attribute.id,
          category.id,
          defaultChannel.id,
          productName,
          defaultChannel.id,
          null,
          null,
          productType.id,
          attribute.id,
          category.id,
          null,
          false,
          false,
          true
        )
        .then(() => {
          const product = productsUtils.getCreatedProduct();
          const productUrl = `${URL_LIST.products}${product.id}`;
          productSteps.updateProductPublish(productUrl, false);
          frontShopProductUtils
            .isProductVisible(productId, defaultChannel.slug, productName)
            .then(isVisible => {
              expect(isVisible).to.be.eq(false);
            });
          cy.loginInShop().then(() => {
            frontShopProductUtils
              .isProductVisible(product.id, defaultChannel.slug, productName)
              .then(isVisible => {
                expect(isVisible).to.be.eq(true);
              });
          });
        });
    });
  });
});