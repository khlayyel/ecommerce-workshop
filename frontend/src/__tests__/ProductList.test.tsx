import { render, screen, waitFor } from '@testing-library/react';
import ProductList from '../components/ProductList';
import { getProducts } from '../api/products';

jest.mock('../api/products');

const mockedGetProducts = getProducts as jest.MockedFunction<typeof getProducts>;

test('affiche la liste des produits', async () => {
  mockedGetProducts.mockResolvedValue({
    data: [{ name: 'PC Portable', price: 999 }]
  } as any);

  render(<ProductList />);

  await waitFor(() => expect(screen.getByText('PC Portable')).toBeInTheDocument());
});
