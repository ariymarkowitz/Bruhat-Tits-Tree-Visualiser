# Bruhat-Tits tree visualiser

https://ariymarkowitz.github.io/Bruhat-Tits-Tree-Visualiser/

This a a visualiser of the Bruhat-Tits tree over ℚp, and the action of GL(2, ℚp) on the tree.

# About the Bruhat-Tits tree

## p-adic numbers

There are a couple of ways of defining the p-adic numbers. One way is to consider the rationals ℚ, and use a different metric (notion of 'distance')–numbers x and y are closer together when (x-y) is a multiple of a large power of p for some given prime p. We may then take the completion, similar to the real numbers, to give a field and metric space ℚp.

The other way of describing the p-adic numbers is to consider them as the field of infinite expansions

a_(-m) p^(-m) + a_(-m+1) p^(-m+1) + ... + a_(0) p^0 + a_1 p^1 + ...

This is similar to the base-p expansion of a real number, however while real numbers can have infinitely many negative terms and finitely many positive terms, p-adic expansions can only have finitely many negative terms and may have infinitely many positive terms. The p-adic numbers in which all of the powers are nonnegative is called a p-adic integer, and the ring ℤp of p-adic integers is analogous to the integers in the field of rational numbers. Note that the rational numbers are the set of p-adic numbers with finitely many terms in the expansion.

The p-adic numbers allow us to use the properties of metric spaces and geometry to explore number-theoretic properties.

## The Bruhat-Tits tree

The Bruhat-Tits tree is a way of visualising the actions of GL(2, K) (invertible 2x2 matrices over K), where K is a local field. In this visualiser, we take K to be ℚp, the p-adic numbers for some prime p. (In actuality, we take K = Q, the rational numbers, since we cannot express the irrational numbers in ℚp with finite precision.)

Let V be the 2-dimensional vector space over K. A *lattice* is a subset of V that is a free submodule of ℤp of rank 2; in other words, a subset of V that is closed under linear combinations with coefficients in ℤp, and is generated by 2 basis vectors. Lattices are similar to vector spaces, but there is an interesting difference: Lattices have sublattices, ie. submodules that are also of rank 2. Given a lattice L, pL is both rank 2 and is properly contained in L since p does not have an inverse in ℤp. In fact we have an infinite chain

L ⊃ pL ⊃ p^2L ⊃ ...

of lattices.

We find an interesting structure when we look at chains of maximal sublattices: L/pL is isomorphic to the vector space Fp^2 over the finite field Fp, hence any lattice has exactly p+1 maximal sublattices. We may form a graph in which vertices are equivalence classes of lattices up to scalar multiplication, and vertices are adjacent if the vertices contain lattices L and L' respectively such that L' is maximal in L. Fascinatingly, this graph turns out to be a tree! We call this the Bruhat-Tits tree.

Another way of viewing at the tree is as a way of building a p-adic expansion. Each vertex contains a unique lattice L generated by vectors (1, u) and (0, p^n) for some u ∈ ℚp, n ∈ ℤ, and since (1, u) can be considered as the projective point corresponding to u, L can be considered to be u up to addition by (p-adic) integer multiples of p^n; in other words, u 'mod p^n'. Hence the vertex can be identified with the p-adic expansion

u_m p^(-m) + u_(m-1) p^(-m+1) + ... + u_(n-1) p^(n-1).

We may write this similar to decimal form, eg: 11.1 in ℚ2 is 3.5 in base 10. For finitely many digits, this is the same as base 2, however p-adic numbers may have infinitely many nonzero digits before the decimal point and finitely many after, while base-p numbers may only have infinitely many nonzero digits after the decimal point and finitely many before. For example, ...11111.0 is written as -1 in base 10.

The neighbours of a vertex are the possible ways to add to the next term in the expansion, together with one neighbour that removes the last term in the expansion. For example, in the Bruhat-Tits tree over ℚ2 the vertex corresponding to 1.000... has neighbours 01.000...,  11.000..., and .000...

Another way to put this is that the vertices represent p-adic numbers up to a certain number of digits of precision, and neighbours are the ways of changing the precision by 1 digit.

Note that 2 pieces of information are needed to represent a vertex: The p-adic integer u, and n such that p^n is the next term in the expansion. We see that the vertex 1\*2^0, for example, is different from the vertex 1\*2^0 + 0\*2^1. We represent this as [u]\_n in the visualiser (this can be seen when hovering over a node).

## Isometries of the tree

Since the vertices are equivalince classes of lattices, the group GL(2, ℚp) of invertible 2x2 matrices acts naturally on the tree by left multiplication. This action can be considered a discrete version of the isometries of the hyperbolic plane (which can be identified with PGL(2, ℝ)), and has similar properties. For example, there are 2 classes of isometries: Elliptic isometries that fix at least one point, and hyperbolic isometries that do not fix any points. Hyperbolic isometries do stabilise a single axis, called the translation axis; these are the set of points translated the minimum amount. In Euclidean space, a translation moves all points the same distance. In hyperbolic space and on the Bruhat-Tits tree, points farther away from the translation axis will be moved a larger amount.

## Boundary of the tree

If each vertex is a finite p-adic expansion, then an infinite path can be associated with an infinite p-adic expansion. Hence we may identify the 'boundary' of the tree with the projective p-adic line. (The point at infinity corresponds to following the 'reverse' path [0]\_n as n → -∞). An infinite ray on the tree is called an 'end', and if we fix the starting point of the ray then each end corresponds to a unique point on the boundary. This is shown in the visualisation by the fact that neighbours farther from the origin are exponentially closer together, so that every infinite ray converges to a unique point. (One may draw an analogy to, or represent this directly with, the Poincaré disk model of the hyperbolic plane.) Thus we can visualise the boundary of the tree. We see that GL(2, ℚp) also acts on the projective p-adic line.

# How to use the visualiser

## Inputs

- 'p' sets the field used to ℚp.
- 'Depth' sets the depth of the tree (maximum distance rendered)
- 'End' shows an end of the tree (an infinite ray starting from the origin). The input may be an integer or rational number. the input a/b corresponds to the projective point (b, a).
- 'Show end at infinity' shows the end corresponding to the projective point at infinity (0, 1).
- 'Isometry' shows the minimum translation set of the isometry induced by a given matrix.
- 'Show image of origin' displays image of the origin under the provided isometry.

## Colour scheme

- The provided end is shown as a red ray starting from the origin.
- The 'end at infinity' is shown in dark red.
- If an isometry is elliptic (fixes a vertex), then the fixed points are shown in blue.
- If an isometry is hyperbolic (translates every vertex), then the translation axis is shown in green.
  - Note: Reflections translate every vertex, and so is shown in green by the visualiser. However the minimal translation set is a pair of neighbouring vertices that are swapped, and the reflection fixes the midpoint between these vertices, and so is actually an elliptic isometry.
- The image of the origin is coloured pink.

## Other features

Hovering over a vertex will show a tooltip displaying the vertex as [u]\_n. This corresponds to the lattice containing the array
```
[[1, 0 ],
 [u,p^n]]
```
