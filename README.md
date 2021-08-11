# Bruhat-Tits-Tree-Visualiser

## About the Bruhat-Tits tree

The Bruhat-Tits tree is a way of visualising the actions of GL(2, K), where K is a local field. In this visualiser, we take K to be ℚp, the p-adic numbers for some prime p. (In actuality, we take K = Q, the rational numbers, since we cannot express the other numbers in ℚp with finite precision.) ℚp comes with a subring ℤp, the ring of p-adic integers.

Let V be the 2-dimensional vector space over K. A *lattice* is a subset of V that is a submodule of ℤp of rank 2; in other words, a subset of V that is closed under linear combinations with coefficients in Zp, and is generated by 2 basis vectors. One interesting thing about lattices is that they have sublattices that are also of rank 2. Given a lattice L, pL is both rank 2 and is properly contained in L since p does not have an inverse in ℤp. In fact we have an infinite chain

L ⊃ pL ⊃ p^2L ⊃ ...

of lattices of rank 2.

We find an interesting structure when we look at chains of maximal lattices: L/pL is isomorphic to the vector space Fp^2 over the finite field Fp, hence any lattice has exactly p+1 maximal sublattices. We may form a graph in which vertices are equivalence classes of lattices up to scalar multiplication, and vertices are adjacent if the vertices contain L and L' respectively such that L' is maximal in L. Fascinatingly, this graph turns out to be a tree!

Another way of viewing at the tree is as a way of building a p-adic expansion. Each vertex v contains a unique lattice L generated by vectors (1, u) and (0, p^n) for some u in ℚp, n in ℤ, and since (1, u) can be considered as the projective point corresponding to u, L can be considered to be u up to addition by (p-adic) integer multiples of p^n; in other words, u 'mod p^n'. Hence v can be identified with the p-adic expansion

u_m p^(-m) + u_(m-1) p^(-m+1) + ... + u_(n-1) p^(n-1).

We may write this similar to decimal form, eg: 11.1 in ℚ2 is 3.5 in base 10. For finitely many digits, this is the same as base 2, however p-adic numbers may have infinitely many nonzero digits before the decimal point and finitely many after, while base-p numbers may only have infinitely many nonzero digits after the decimal point and finitely many before. For example, ...11111.0 is written as -1 in base 10.

The neighbours of a vertex are the possible ways to add to the next term in the expansion, together with one neighbour that removes the last term in the expansion. For example, in the Bruhat-Tits tree over ℚ2 the vertex corresponding to 1.000... has neighbours 01.000...,  11.000..., and .000...

Note that 2 pieces of information are needed to represent a vertex: The p-adic integer u, and n such that p^n is the next term in the expansion. We see that the vertex 1\*2^0, for example, is different from the vertex 1\*2^0 + 0\*2^1. We represent this as [u]\_n in the visualiser (this can be seen when hovering over a node).

## Isometries of the tree

Since the vertices are lattices, the group GL(2, ℚp) of invertible 2x2 matrices acts on the tree by left multiplication. This action can be considered a discrete version of the isometries of the hyperbolic plane (which can be identified with PGL(2, ℝ)), and has similar properties. For example, there are 2 classes of isometries: Elliptic isometries that fix at least one point, and hyperbolic isometries that do not fix any points. Hyperbolic isometries do stabilise a single axis, called the translation axis; these are the set of points translated the minimum amount. In Euclidean space, a translation moved all points the same distance. In hyperbolic space and on the Bruhat-Tits tree, points farther away from the translation axis will be moved a larger amount.

## Boundary of the tree

If each vertex is a finite step in a p-adic expansion, then an infinite path can be associated with an infinite p-adic expansion. Hence we may identify the 'boundary' of the tree with the projective p-adic line. (The point at infinity corresponds to following the 'reverse' path [u]\_n as n goes to -infinity). An infinite ray on the tree is called an 'end', and if we fix the starting point of the ray then each end corresponds to a unique point on the boundary. We see, then, that GL(2, ℚp) also acts on the projective p-adic line. This is shown by the fact that neighbours farther from the origin are exponentially closer together, so that every infinite ray converges to a unique point. (One may draw an analogy to, or represent this directly with, the Poincaré disk model of the hyperbolic plane.) Thus we can visualise the boundary of the tree.
