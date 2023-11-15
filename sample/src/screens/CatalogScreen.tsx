/*
MIT License

Copyright 2023 - Present, Shopify Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import React, {useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import ShopifyCheckout from '../../../package/ShopifyCheckout';
import useShopify from '../hooks/useShopify';

import type {ShopifyProduct} from '../../@types';
import {Colors, useTheme} from '../context/Theme';
import {useCart} from '../context/Cart';

function App(): JSX.Element {
  const {checkoutURL, totalQuantity, addToCart, addingToCart} = useCart();
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const {queries} = useShopify();

  const [fetchProducts, {loading, data, error: errorFetchingProducts}] =
    queries.products;

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const presentCheckout = async () => {
    if (checkoutURL) {
      ShopifyCheckout.present(checkoutURL);
    }
  };

  if (errorFetchingProducts) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>
          An error occurred while loading the catalog
        </Text>
        <Text style={styles.loadingText}>
          {errorFetchingProducts?.name} {errorFetchingProducts?.message}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Loading catalog...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollView}>
        <View style={styles.productList}>
          {data?.products.edges.map(({node}) => (
            <Product
              key={node.id}
              product={node}
              loading={addingToCart.has(getVariant(node).id)}
              onAddToCart={addToCart}
            />
          ))}
        </View>
      </ScrollView>
      {totalQuantity > 0 && (
        <Pressable
          style={styles.cartButton}
          disabled={totalQuantity === 0}
          onPress={presentCheckout}>
          <Text style={styles.cartButtonText}>Checkout</Text>
          <Text style={styles.cartButtonTextSubtitle}>
            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
          </Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

function getVariant(node: ShopifyProduct) {
  return node.variants.edges[0].node;
}

function Product({
  product,
  onAddToCart,
  loading = false,
}: {
  product: ShopifyProduct;
  loading?: boolean;
  onAddToCart: (variantId: string) => void;
}) {
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const image = product.images?.edges[0].node;
  const variant = getVariant(product);

  return (
    <View key={product.id} style={styles.productItem}>
      <Image
        resizeMethod="resize"
        resizeMode="cover"
        style={styles.productImage}
        alt={image?.altText}
        source={{uri: image?.url}}
      />
      <View style={styles.productText}>
        <View>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>
            £{Number(variant?.price.amount).toFixed(2)}{' '}
            {variant?.price.currencyCode}
          </Text>
        </View>
        <View style={styles.addToCartButtonContainer}>
          {loading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Pressable
              style={styles.addToCartButton}
              onPress={() => onAddToCart(variant.id)}>
              <Text style={styles.addToCartButtonText}>Add to cart</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

export default App;

function createStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      maxHeight: '100%',
    },
    loading: {
      flex: 1,
      p: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginVertical: 20,
      color: colors.text,
    },
    scrollView: {
      paddingBottom: 55,
    },
    cartButton: {
      position: 'absolute',
      width: 'auto',
      bottom: 10,
      height: 55,
      left: 0,
      right: 0,
      borderRadius: 10,
      marginHorizontal: 20,
      padding: 10,
      backgroundColor: colors.secondary,
      fontWeight: 'bold',
    },
    cartButtonText: {
      fontSize: 16,
      lineHeight: 20,
      textAlign: 'center',
      color: colors.secondaryText,
      fontWeight: 'bold',
    },
    cartButtonTextSubtitle: {
      fontSize: 12,
      textAlign: 'center',
      color: colors.textSubdued,
      fontWeight: 'bold',
    },
    productList: {
      marginVertical: 20,
      paddingHorizontal: 16,
    },
    productItem: {
      flex: 1,
      flexDirection: 'row',
      marginBottom: 10,
      padding: 10,
      backgroundColor: colors.backgroundSubdued,
      borderRadius: 5,
    },
    productText: {
      paddingLeft: 20,
      paddingTop: 10,
      flexShrink: 1,
      flexGrow: 1,
      color: colors.textSubdued,
      justifyContent: 'space-between',
    },
    productTitle: {
      fontSize: 16,
      marginBottom: 5,
      fontWeight: 'bold',
      lineHeight: 20,
      color: colors.text,
    },
    productPrice: {
      fontSize: 14,
      flex: 1,
      color: colors.textSubdued,
    },
    productImage: {
      width: 80,
      height: 120,
      marginRight: 5,
      borderRadius: 6,
    },
    addToCartButtonContainer: {
      alignItems: 'flex-end',
      flexShrink: 1,
      flexGrow: 0,
    },
    addToCartButton: {
      borderRadius: 10,
      fontSize: 8,
      margin: 5,
      backgroundColor: 'transparent',
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    addToCartButtonText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.primary,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
}
