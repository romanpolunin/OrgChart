/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2016
 * @compiler Bridge.NET 15.3.0
 */
Bridge.assembly("Staffer.OrgChart.Layout.JScript.Bridge", function ($asm, globals) {
    "use strict";

    /**
     * @memberof System
     * @callback System.Func
     * @param   {string}                          arg
     * @return  {Staffer.OrgChart.Layout.Size}
     */

    /** @namespace System */

    /**
     * @memberof System
     * @callback System.EventHandler
     * @param   {Object}                                              sender    
     * @param   {Staffer.OrgChart.Layout.BoundaryChangedEventArgs}    e
     * @return  {void}
     */

    /** @namespace Staffer.OrgChart.Annotations */

    /**
     * TODO: remove.
     *
     * @public
     * @class Staffer.OrgChart.Annotations.CanBeNullAttribute
     * @augments System.Attribute
     */
    Bridge.define("Staffer.OrgChart.Annotations.CanBeNullAttribute", {
        inherits: [System.Attribute]
    });

    /**
     * Describes dependency between method input and output.
     *
     * @public
     * @class Staffer.OrgChart.Annotations.ContractAnnotationAttribute
     * @augments System.Attribute
     */
    Bridge.define("Staffer.OrgChart.Annotations.ContractAnnotationAttribute", {
        inherits: [System.Attribute],
        config: {
            properties: {
                /**
                 * Text of the contract.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Annotations.ContractAnnotationAttribute
                 * @memberof Staffer.OrgChart.Annotations.ContractAnnotationAttribute
                 * @function getContract
                 * @return  {string}
                 */
                /**
                 * Text of the contract.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Annotations.ContractAnnotationAttribute
                 * @memberof Staffer.OrgChart.Annotations.ContractAnnotationAttribute
                 * @function setContract
                 * @param   {string}    value
                 * @return  {void}
                 */
                Contract: null,
                /**
                 * Require full list of states/possible values for covered member.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Annotations.ContractAnnotationAttribute
                 * @memberof Staffer.OrgChart.Annotations.ContractAnnotationAttribute
                 * @function getForceFullStates
                 * @return  {boolean}
                 */
                /**
                 * Require full list of states/possible values for covered member.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Annotations.ContractAnnotationAttribute
                 * @memberof Staffer.OrgChart.Annotations.ContractAnnotationAttribute
                 * @function setForceFullStates
                 * @param   {boolean}    value
                 * @return  {void}
                 */
                ForceFullStates: false
            }
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Annotations.ContractAnnotationAttribute
         * @memberof Staffer.OrgChart.Annotations.ContractAnnotationAttribute
         * @param   {string}    contract
         * @return  {void}
         */
        ctor: function (contract) {
            Staffer.OrgChart.Annotations.ContractAnnotationAttribute.$ctor1.call(this, contract, false);
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Annotations.ContractAnnotationAttribute
         * @memberof Staffer.OrgChart.Annotations.ContractAnnotationAttribute
         * @param   {string}     contract           
         * @param   {boolean}    forceFullStates
         * @return  {void}
         */
        $ctor1: function (contract, forceFullStates) {
            this.$initialize();
            System.Attribute.ctor.call(this);
            this.setContract(contract);
            this.setForceFullStates(forceFullStates);
        }
    });

    /**
     * TODO: remove.
     *
     * @public
     * @class Staffer.OrgChart.Annotations.NotNullAttribute
     * @augments System.Attribute
     */
    Bridge.define("Staffer.OrgChart.Annotations.NotNullAttribute", {
        inherits: [System.Attribute]
    });

    /**
     * Indicates that a method does not make any observable state changes.
     The same as <pre><code>System.Diagnostics.Contracts.PureAttribute</code></pre>.
     *
     * @public
     * @class Staffer.OrgChart.Annotations.PureAttribute
     * @augments System.Attribute
     * @example
     *
     * [Pure] int Multiply(int x, int y) => x * y;
     * void M() {
     *   Multiply(123, 42); // Waring: Return value of pure method is not used
     * }
     * 
     *
     *
     */
    Bridge.define("Staffer.OrgChart.Annotations.PureAttribute", {
        inherits: [System.Attribute]
    });

    /** @namespace Staffer.OrgChart.Layout */

    /**
     * Left and right edges of some group of boxes.
     *
     * @public
     * @class Staffer.OrgChart.Layout.Boundary
     */
    Bridge.define("Staffer.OrgChart.Layout.Boundary", {
        /**
         * Left edge. Each element is a point in some logical space.
         Vertical position is determined by the index of the element offset from Top,
         using certain resolution (resolution is defined externally).
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @type System.Collections.Generic.List$1
         */
        left: null,
        /**
         * Right edge. Each element is a point in some logical space.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @type System.Collections.Generic.List$1
         */
        right: null,
        /**
         * A margin to add on top and under each box, to prevent edges from coming too close to each other.
         Normally, branch connector spacers prevent most of such visual effects,
         but it is still possible to have one box almost touching another when there's no other cushion around it.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @type number
         */
        verticalMargin: 0,
        /**
         * A temporary Boundary used for merging Boxes in, since they don't come with their own Boundary.
         *
         * @instance
         * @private
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @type Staffer.OrgChart.Layout.Boundary
         */
        m_spacerMerger: null,
        config: {
            properties: {
                /**
                 * Bounding rectangle.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.Boundary
                 * @memberof Staffer.OrgChart.Layout.Boundary
                 * @function getBoundingRect
                 * @return  {Staffer.OrgChart.Layout.Rect}
                 */
                /**
                 * Bounding rectangle.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Layout.Boundary
                 * @memberof Staffer.OrgChart.Layout.Boundary
                 * @function setBoundingRect
                 * @param   {Staffer.OrgChart.Layout.Rect}    value
                 * @return  {void}
                 */
                BoundingRect: null
            },
            init: function () {
                this.BoundingRect = new Staffer.OrgChart.Layout.Rect();
            }
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @param   {number}    verticalMargin
         * @return  {void}
         */
        $ctor1: function (verticalMargin) {
            Staffer.OrgChart.Layout.Boundary.ctor.call(this, true, verticalMargin);
        },
        ctor: function (frompublic, verticalMargin) {
            this.$initialize();
            if (verticalMargin < 0) {
                throw new System.ArgumentOutOfRangeException("verticalMargin");
            }
            this.verticalMargin = verticalMargin;

            this.left = new (System.Collections.Generic.List$1(Staffer.OrgChart.Layout.Boundary.Step))();
            this.right = new (System.Collections.Generic.List$1(Staffer.OrgChart.Layout.Boundary.Step))();

            if (frompublic) {
                this.m_spacerMerger = new Staffer.OrgChart.Layout.Boundary.ctor(false, 0);
            }
        },
        /**
         * Resets the edges, use when re-using this object from pool.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @param   {Staffer.OrgChart.Layout.Box}    box
         * @return  {void}
         */
        prepareForHorizontalLayout: function (box) {
            this.prepare(box);

            if (box.disableCollisionDetection) {
                return;
            }

            var rect = box.frame.exterior;

            var margin = box.isSpecial ? this.verticalMargin : 0;
            this.left.add(new Staffer.OrgChart.Layout.Boundary.Step.$ctor1(box, rect.getLeft(), rect.getTop() - margin, rect.getBottom() + margin));
            this.right.add(new Staffer.OrgChart.Layout.Boundary.Step.$ctor1(box, rect.getRight(), rect.getTop() - margin, rect.getBottom() + margin));
        },
        /**
         * Resets the edges, use when re-using this object from pool.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @param   {Staffer.OrgChart.Layout.Box}    box
         * @return  {void}
         */
        prepare: function (box) {
            this.left.clear();
            this.right.clear();

            // adjust the top edge to fit the logical grid
            this.setBoundingRect(box.frame.exterior);
        },
        /**
         * Merges another boundary into this one, potentially pushing its edges out.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @param   {Staffer.OrgChart.Layout.Boundary}    other
         * @return  {void}
         */
        verticalMergeFrom: function (other) {
            this.setBoundingRect(Staffer.OrgChart.Layout.Rect.op_Addition(this.getBoundingRect(), other.getBoundingRect()));
        },
        /**
         * Merges another boundary into this one, potentially pushing its edges out.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @param   {Staffer.OrgChart.Layout.Boundary}    other
         * @return  {void}
         */
        mergeFrom: function (other) {
            if (other.getBoundingRect().getTop() >= other.getBoundingRect().getBottom()) {
                throw new System.ArgumentException("Cannot merge boundary of height " + System.Double.format((other.getBoundingRect().getBottom() - other.getBoundingRect().getTop()), 'G'));
            }

            var merge = 114;
            while (merge !== 0) {
                var mySteps = merge === 114 ? this.right : this.left;
                var theirSteps = merge === 114 ? other.right : other.left;
                var i = 0;
                var k = 0;
                for (; k < theirSteps.getCount() && i < mySteps.getCount(); ) {
                    var my = mySteps.getItem(i);
                    var th = theirSteps.getItem(k);

                    if (my.bottom <= th.top) {
                        // haven't reached the top of their boundary yet
                        i = (i + 1) | 0;
                        continue;
                    }

                    if (th.bottom <= my.top) {
                        // haven't reached the top of my boundary yet
                        mySteps.insert(i, th);
                        k = (k + 1) | 0;

                        this.validateState();
                        continue;
                    }

                    var theirWins = (merge === 114 && my.x <= th.x) || (merge === 108 && my.x >= th.x);

                    if (my.top === th.top) {
                        if (my.bottom === th.bottom) {
                            // case 1: exactly same length and vertical position
                            // th: ********
                            // my: ********
                            if (theirWins) {
                                mySteps.setItem(i, th); // replace entire step
                            }
                            i = (i + 1) | 0;
                            k = (k + 1) | 0;

                            this.validateState();
                        } else if (my.bottom < th.bottom) {
                            // case 2: tops aligned, but my is shorter 
                            // th: ********
                            // my: ***
                            if (theirWins) {
                                mySteps.setItem(i, my.changeBox(th.box, th.x)); // replace my with a piece of theirs
                            }
                            theirSteps.setItem(k, th.changeTop(my.bottom)); // push their top down
                            i = (i + 1) | 0;

                            this.validateState();
                        } else {
                            // case 3: tops aligned, but my is longer
                            // th: ***
                            // my: ********
                            if (theirWins) {
                                mySteps.setItem(i, my.changeTop(th.bottom)); // contract my to their bottom
                                mySteps.insert(i, th); // insert theirs before my
                                i = (i + 1) | 0;
                            }
                            k = (k + 1) | 0;

                            this.validateState();
                        }
                    } else if (my.bottom === th.bottom) {
                        if (my.top < th.top) {
                            // case 4: bottoms aligned, but my is longer
                            // th:      ***
                            // my: ********
                            if (theirWins) {
                                mySteps.setItem(i, my.changeBottom(th.top)); // contract my to their top
                                mySteps.insert(((i + 1) | 0), th); // insert theirs after my
                                i = (i + 1) | 0;
                            }
                            i = (i + 1) | 0;
                            k = (k + 1) | 0;

                            this.validateState();
                        } else {
                            // case 5: bottoms aligned, but my is shorter
                            // th: ********
                            // my:      ***
                            if (theirWins) {
                                // replace my with theirs, we're guaranteed not to offend my previous
                                mySteps.setItem(i, th);
                            } else {
                                // insert a piece of theirs before my, we're guaranteed not to offend my previous
                                mySteps.insert(i, th.changeBottom(my.top));
                                i = (i + 1) | 0;
                            }
                            i = (i + 1) | 0;
                            k = (k + 1) | 0;

                            this.validateState();
                        }
                    } else if (my.top < th.top && my.bottom < th.bottom) {
                        // case 6: their overlaps my bottom
                        // th:     ********
                        // my: *******
                        if (theirWins) {
                            mySteps.setItem(i, my.changeBottom(th.top)); // contract myself to their top
                            mySteps.insert(((i + 1) | 0), new Staffer.OrgChart.Layout.Boundary.Step.$ctor1(th.box, th.x, th.top, my.bottom)); // insert a piece of theirs after my
                            i = (i + 1) | 0;
                        }
                        theirSteps.setItem(k, th.changeTop(my.bottom)); // push theirs down
                        i = (i + 1) | 0;

                        this.validateState();
                    } else if (my.top < th.top && my.bottom > th.bottom) {
                        // case 7: their cuts my into three pieces
                        // th:     ***** 
                        // my: ************
                        if (theirWins) {
                            mySteps.setItem(i, my.changeBottom(th.top)); // contract my to their top
                            mySteps.insert(((i + 1) | 0), th); // insert their after my
                            mySteps.insert(((i + 2) | 0), my.changeTop(th.bottom)); // insert my tail after theirs
                            i = (i + 2) | 0;
                        }
                        k = (k + 1) | 0;

                        this.validateState();
                    } else if (my.bottom > th.bottom) {
                        // case 8: their overlaps my top
                        // th: ********
                        // my:    ********
                        if (theirWins) {
                            mySteps.setItem(i, my.changeTop(th.bottom)); // contract my to their bottom
                            // insert theirs before my, we're guaranteed not to offend my previous
                            mySteps.insert(i, th);
                        } else {
                            mySteps.insert(i, th.changeBottom(my.top));
                        }
                        i = (i + 1) | 0;
                        k = (k + 1) | 0;

                        this.validateState();
                    } else {
                        // case 9: their completely covers my
                        // th: ************
                        // my:    *****
                        if (theirWins) {
                            mySteps.setItem(i, th.changeBottom(my.bottom)); // replace my with a piece of theirs
                        } else {
                            mySteps.insert(i, th.changeBottom(my.top));
                            i = (i + 1) | 0;
                        }
                        theirSteps.setItem(k, th.changeTop(my.bottom)); // push theirs down
                        i = (i + 1) | 0;

                        this.validateState();
                    }
                }

                if (i === mySteps.getCount()) {
                    while (k < theirSteps.getCount()) {
                        mySteps.add(theirSteps.getItem(k));
                        k = (k + 1) | 0;

                        this.validateState();
                    }
                }

                merge = merge === 114 ? 108 : 0;
            }

            this.setBoundingRect(Staffer.OrgChart.Layout.Rect.op_Addition(this.getBoundingRect(), other.getBoundingRect()));
        },
        /**
         * Merges a box into this one, potentially pushing its edges out.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @param   {Staffer.OrgChart.Layout.Box}    box
         * @return  {void}
         */
        mergeFrom$1: function (box) {
            if (box.disableCollisionDetection) {
                return;
            }

            var rect = box.frame.exterior;

            if (rect.size.height === 0) {
                return;
            }

            this.m_spacerMerger.prepareForHorizontalLayout(box);
            this.mergeFrom(this.m_spacerMerger);
        },
        validateState: function () {
            for (var i = 1; i < this.left.getCount(); i = (i + 1) | 0) {
                if (this.left.getItem(i).top < this.left.getItem(((i - 1) | 0)).bottom || this.left.getItem(i).top <= this.left.getItem(((i - 1) | 0)).top || this.left.getItem(i).bottom <= this.left.getItem(i).top || this.left.getItem(i).bottom <= this.left.getItem(((i - 1) | 0)).bottom) {
                    throw new System.Exception("State error at Left index " + i);
                }
            }

            for (var i1 = 1; i1 < this.right.getCount(); i1 = (i1 + 1) | 0) {
                if (this.right.getItem(i1).top < this.right.getItem(((i1 - 1) | 0)).bottom || this.right.getItem(i1).top <= this.right.getItem(((i1 - 1) | 0)).top || this.right.getItem(i1).bottom <= this.right.getItem(i1).top || this.right.getItem(i1).bottom <= this.right.getItem(((i1 - 1) | 0)).bottom) {
                    throw new System.Exception("State error at Right index " + i1);
                }
            }
        },
        /**
         * Returns max horizontal overlap between myself and <b />.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @param   {Staffer.OrgChart.Layout.Boundary}    other             
         * @param   {number}                              siblingSpacing    
         * @param   {number}                              branchSpacing
         * @return  {number}
         */
        computeOverlap: function (other, siblingSpacing, branchSpacing) {
            var i = 0, k = 0;
            var offense = 0.0;
            while (i < this.right.getCount() && k < other.left.getCount()) {
                var my = this.right.getItem(i);
                var th = other.left.getItem(k);

                if (my.bottom <= th.top) {
                    i = (i + 1) | 0;
                } else if (th.bottom <= my.top) {
                    k = (k + 1) | 0;
                } else {
                    var desiredSpacing = my.box.isSpecial || th.box.isSpecial ? 0 : my.box.visualParentId === th.box.visualParentId ? siblingSpacing : branchSpacing; // these are two different branches

                    var diff = my.x + desiredSpacing - th.x;
                    if (diff > offense) {
                        offense = diff;
                    }

                    if (my.bottom >= th.bottom) {
                        k = (k + 1) | 0;
                    }
                    if (th.bottom >= my.bottom) {
                        i = (i + 1) | 0;
                    }
                }
            }

            return offense;
        },
        /**
         * Re-initializes left and right edges based on actual coordinates of boxes.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary
         * @memberof Staffer.OrgChart.Layout.Boundary
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    branchRoot
         * @return  {void}
         */
        reloadFromBranch: function (branchRoot) {
            var leftmost = System.Double.max;
            var rightmost = System.Double.min;
            for (var i = 0; i < this.left.getCount(); i = (i + 1) | 0) {
                var left = this.left.getItem(i);
                var rect = left.box.frame.exterior;
                this.left.setItem(i, left.changeBox(left.box, rect.getLeft()));
                leftmost = Math.min(leftmost, rect.getLeft());
            }

            for (var i1 = 0; i1 < this.right.getCount(); i1 = (i1 + 1) | 0) {
                var right = this.right.getItem(i1);
                var rect1 = right.box.frame.exterior;
                this.right.setItem(i1, right.changeBox(right.box, rect1.getRight()));
                rightmost = Math.max(rightmost, rect1.getRight());
            }

            leftmost = Math.min(branchRoot.getElement().frame.exterior.getLeft(), leftmost);
            rightmost = Math.max(branchRoot.getElement().frame.exterior.getRight(), rightmost);

            this.setBoundingRect(new Staffer.OrgChart.Layout.Rect.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(leftmost, this.getBoundingRect().getTop()), new Staffer.OrgChart.Layout.Size.$ctor1(rightmost - leftmost, this.getBoundingRect().size.height)));
        }
    });

    /**
     * A single step of the boundary.
     Each individual element in {@link } and {@link } collections
     represents one step of the boundary.
     *
     * @public
     * @class Staffer.OrgChart.Layout.Boundary.Step
     */
    Bridge.define("Staffer.OrgChart.Layout.Boundary.Step", {
        $kind: "struct",
        statics: {
            getDefaultValue: function () { return new Staffer.OrgChart.Layout.Boundary.Step(); }
        },
        /**
         * Which {@link } holds this edge.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Boundary.Step
         * @type Staffer.OrgChart.Layout.Box
         */
        box: null,
        /**
         * Horizontal position of the edge.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Boundary.Step
         * @type number
         */
        x: 0,
        /**
         * Top edge.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Boundary.Step
         * @type number
         */
        top: 0,
        /**
         * Bottom edge.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Boundary.Step
         * @type number
         */
        bottom: 0,
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary.Step
         * @memberof Staffer.OrgChart.Layout.Boundary.Step
         * @param   {Staffer.OrgChart.Layout.Box}    box       
         * @param   {number}                         x         
         * @param   {number}                         top       
         * @param   {number}                         bottom
         * @return  {void}
         */
        $ctor1: function (box, x, top, bottom) {
            this.$initialize();
            this.box = box;
            this.x = x;
            this.top = top;
            this.bottom = bottom;
        },
        ctor: function () {
            this.$initialize();
        },
        /**
         * Returns a new {@link } whose {@link } property was set to <b />.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary.Step
         * @memberof Staffer.OrgChart.Layout.Boundary.Step
         * @param   {number}                                   newTop
         * @return  {Staffer.OrgChart.Layout.Boundary.Step}
         */
        changeTop: function (newTop) {
            return new Staffer.OrgChart.Layout.Boundary.Step.$ctor1(this.box, this.x, newTop, this.bottom);
        },
        /**
         * Returns a new {@link } whose {@link } property was set to <b />.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary.Step
         * @memberof Staffer.OrgChart.Layout.Boundary.Step
         * @param   {number}                                   newBottom
         * @return  {Staffer.OrgChart.Layout.Boundary.Step}
         */
        changeBottom: function (newBottom) {
            return new Staffer.OrgChart.Layout.Boundary.Step.$ctor1(this.box, this.x, this.top, newBottom);
        },
        /**
         * Returns a new {@link } whose {@link } property was set to <b /> and {@link } to <b />.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Boundary.Step
         * @memberof Staffer.OrgChart.Layout.Boundary.Step
         * @param   {Staffer.OrgChart.Layout.Box}              newBox    
         * @param   {number}                                   newX
         * @return  {Staffer.OrgChart.Layout.Boundary.Step}
         */
        changeBox: function (newBox, newX) {
            return new Staffer.OrgChart.Layout.Boundary.Step.$ctor1(newBox, newX, this.top, this.bottom);
        },
        getHashCode: function () {
            var h = Bridge.addHash([1885697107, this.box, this.x, this.top, this.bottom]);
            return h;
        },
        equals: function (o) {
            if (!Bridge.is(o, Staffer.OrgChart.Layout.Boundary.Step)) {
                return false;
            }
            return Bridge.equals(this.box, o.box) && Bridge.equals(this.x, o.x) && Bridge.equals(this.top, o.top) && Bridge.equals(this.bottom, o.bottom);
        },
        $clone: function (to) { return this; }
    });

    /**
     * Called when boundary is updated.
     *
     * @public
     * @class Staffer.OrgChart.Layout.BoundaryChangedEventArgs
     */
    Bridge.define("Staffer.OrgChart.Layout.BoundaryChangedEventArgs", {
        /**
         * Current layout state.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.BoundaryChangedEventArgs
         * @type Staffer.OrgChart.Layout.LayoutState
         */
        state: null,
        /**
         * The boundary whose state has been changed.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.BoundaryChangedEventArgs
         * @type Staffer.OrgChart.Layout.Boundary
         */
        boundary: null,
        config: {
            init: function () {
                this.layoutLevel = new Staffer.OrgChart.Layout.LayoutState.LayoutLevel();
            }
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.BoundaryChangedEventArgs
         * @memberof Staffer.OrgChart.Layout.BoundaryChangedEventArgs
         * @param   {Staffer.OrgChart.Layout.Boundary}                   boundary       
         * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    layoutLevel    
         * @param   {Staffer.OrgChart.Layout.LayoutState}                state
         * @return  {void}
         */
        ctor: function (boundary, layoutLevel, state) {
            this.$initialize();
            this.boundary = boundary;
            this.layoutLevel = layoutLevel;
            this.state = state;
        }
    });

    /**
     * A box in some {@link }. Has {@link } and layout-related config such as {@link }.
     This is a purely visual object, created based on underlying chart's data.
     *
     * @public
     * @class Staffer.OrgChart.Layout.Box
     */
    Bridge.define("Staffer.OrgChart.Layout.Box", {
        statics: {
            /**
             * Value to be used for box identifier to indicate an absent box.
             *
             * @static
             * @public
             * @memberof Staffer.OrgChart.Layout.Box
             * @constant
             * @default -1
             * @type number
             */
            None: -1,
            /**
             * Ctr. for auto-generated boxes.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.Box
             * @memberof Staffer.OrgChart.Layout.Box
             * @param   {number}                         id                           
             * @param   {number}                         visualParentId               
             * @param   {boolean}                        disableCollisionDetection
             * @return  {Staffer.OrgChart.Layout.Box}
             */
            special: function (id, visualParentId, disableCollisionDetection) {
                return new Staffer.OrgChart.Layout.Box.$ctor1(null, id, visualParentId, true, disableCollisionDetection);
            }
        },
        /**
         * Identifier of this box. Unique in the scope of the parent {@link }.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Box
         * @type number
         */
        id: 0,
        /**
         * Identifier of the parent box, usually driven by corresponding relationship between underlying data items.
         This parent is for the visual connections and arrangement of children boxes with their parents.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Box
         * @type number
         */
        visualParentId: 0,
        /**
         * Identifier of some externally provided data item for which this box was created.
         Can be null for auto-generated boxes and manually added boxes.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Box
         * @type string
         */
        dataId: null,
        /**
         * This box has been auto-generated for layout purposes,
         so it can be deleted and re-created as needed.
         Special boxes are usually not stored in the {@link } (except {@link }).
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Box
         * @type boolean
         */
        isSpecial: false,
        /**
         * <pre><code>False</code></pre> (default) to enable collision detection for this box,
         e.g. whether it can make impact on {@link }.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Box
         * @type boolean
         */
        disableCollisionDetection: false,
        /**
         * Layout strategy that should be used to apply layout on this Box and its children.
         References an element in {@link }.
         If <pre><code>null</code></pre>, use settings.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.Box
         * @type string
         */
        layoutStrategyId: null,
        /**
         * Bounding box.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Box
         * @type Staffer.OrgChart.Layout.Frame
         */
        frame: null,
        /**
         * When <pre><code>true</code></pre>, layout operations can be applied only to this box.
         Its children will not participate in the layout.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.Box
         * @type boolean
         */
        isCollapsed: false,
        /**
         * When <pre><code>true</code></pre>, this box and its children will not participate in the layout.
         Is automatically set to <pre><code>true</code></pre> when any parent upwards is {@link }.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.Box
         * @type boolean
         */
        affectsLayout: false,
        /**
         * Ctr. for normal and data-bound boxes.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Box
         * @memberof Staffer.OrgChart.Layout.Box
         * @param   {string}    dataId            
         * @param   {number}    id                
         * @param   {number}    visualParentId
         * @return  {void}
         */
        ctor: function (dataId, id, visualParentId) {
            Staffer.OrgChart.Layout.Box.$ctor1.call(this, dataId, id, visualParentId, false, false);
        },
        $ctor1: function (dataId, id, visualParentId, isSpecial, disableCollisionDetection) {
            this.$initialize();
            if (id === 0) {
                throw new System.ArgumentOutOfRangeException("id");
            }

            this.id = id;
            this.visualParentId = visualParentId;
            this.dataId = dataId;
            this.frame = new Staffer.OrgChart.Layout.Frame();
            this.isSpecial = isSpecial;
            this.affectsLayout = true;
            this.disableCollisionDetection = disableCollisionDetection;
        },
        /**
         * <pre><code>true</code></pre> is this box is bound to some data item.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Box
         * @memberof Staffer.OrgChart.Layout.Box
         * @function getIsDataBound
         * @return  {boolean}
         */
        /**
         * <pre><code>true</code></pre> is this box is bound to some data item.
         *
         * @instance
         * @function setIsDataBound
         */
        getIsDataBound: function () {
            return !System.String.isNullOrEmpty(this.dataId);
        }
    });

    /**
     * A container for a bunch of {@link } objects. Defines scope of uniqueness of their identifiers.
     Used by {@link } when computing boxes.
     *
     * @public
     * @class Staffer.OrgChart.Layout.BoxContainer
     */
    Bridge.define("Staffer.OrgChart.Layout.BoxContainer", {
        m_lastBoxId: 0,
        m_boxesById: null,
        m_boxesByDataId: null,
        config: {
            properties: {
                /**
                 * Auto-generated system root box. Added to guarantee a single-root hierarchy.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.BoxContainer
                 * @memberof Staffer.OrgChart.Layout.BoxContainer
                 * @function getSystemRoot
                 * @return  {Staffer.OrgChart.Layout.Box}
                 */
                /**
                 * Auto-generated system root box. Added to guarantee a single-root hierarchy.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.BoxContainer
                 * @memberof Staffer.OrgChart.Layout.BoxContainer
                 * @function setSystemRoot
                 * @param   {Staffer.OrgChart.Layout.Box}    value
                 * @return  {void}
                 */
                SystemRoot: null
            },
            init: function () {
                this.m_boxesById = new (System.Collections.Generic.Dictionary$2(System.Int32,Staffer.OrgChart.Layout.Box))();
                this.m_boxesByDataId = new (System.Collections.Generic.Dictionary$2(String,Staffer.OrgChart.Layout.Box))();
            }
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.BoxContainer
         * @memberof Staffer.OrgChart.Layout.BoxContainer
         * @return  {void}
         */
        ctor: function () {
            this.$initialize();
        },
        /**
         * Ctr. for case with readily available data source.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.BoxContainer
         * @memberof Staffer.OrgChart.Layout.BoxContainer
         * @param   {Staffer.OrgChart.Layout.IChartDataSource}    source
         * @return  {void}
         */
        $ctor1: function (source) {
            this.$initialize();
            this.reloadBoxes(source);
        },
        /**
         * Access to internal collection of boxes.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.BoxContainer
         * @memberof Staffer.OrgChart.Layout.BoxContainer
         * @function getBoxesById
         * @return  {System.Collections.Generic.IDictionary$2}
         */
        /**
         * Access to internal collection of boxes.
         *
         * @instance
         * @function setBoxesById
         */
        getBoxesById: function () {
            return this.m_boxesById;
        },
        /**
         * Access to internal collection of boxes.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.BoxContainer
         * @memberof Staffer.OrgChart.Layout.BoxContainer
         * @function getBoxesByDataId
         * @return  {System.Collections.Generic.IDictionary$2}
         */
        /**
         * Access to internal collection of boxes.
         *
         * @instance
         * @function setBoxesByDataId
         */
        getBoxesByDataId: function () {
            return this.m_boxesByDataId;
        },
        /**
         * Wipes out and re-loads boxes collection from the data store.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.BoxContainer
         * @memberof Staffer.OrgChart.Layout.BoxContainer
         * @param   {Staffer.OrgChart.Layout.IChartDataSource}    source
         * @return  {void}
         */
        reloadBoxes: function (source) {
            var $t, $t1;
            this.m_boxesByDataId.clear();
            this.m_boxesById.clear();
            this.m_lastBoxId = 0;

            // generate system root box, 
            // but don't add it to the list of boxes yet
            this.setSystemRoot(Staffer.OrgChart.Layout.Box.special(((this.m_lastBoxId = (this.m_lastBoxId + 1) | 0)), Staffer.OrgChart.Layout.Box.None, false));

            var map = new (System.Collections.Generic.Dictionary$2(String,System.Int32))();

            // generate identifiers mapping, need this first since data comes in random order
            $t = Bridge.getEnumerator(source.Staffer$OrgChart$Layout$IChartDataSource$getAllDataItemIds(), null, String);
            while ($t.moveNext()) {
                var dataId = $t.getCurrent();
                map.add(dataId, this.nextBoxId());
            }

            // add data-bound boxes
            $t1 = Bridge.getEnumerator(source.Staffer$OrgChart$Layout$IChartDataSource$getAllDataItemIds(), null, String);
            while ($t1.moveNext()) {
                var dataId1 = $t1.getCurrent();
                var parentDataId = System.String.isNullOrEmpty(dataId1) ? null : source.Staffer$OrgChart$Layout$IChartDataSource$getGetParentKeyFunc()(dataId1);
                var visualParentId = System.String.isNullOrEmpty(parentDataId) ? this.getSystemRoot().id : map.get(parentDataId);

                this.addBox$1(dataId1, map.get(dataId1), visualParentId);
            }

            // now add the root
            this.m_boxesById.add(this.getSystemRoot().id, this.getSystemRoot());
        },
        /**
         * Creates a new {@link } and adds it to collection.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.BoxContainer
         * @memberof Staffer.OrgChart.Layout.BoxContainer
         * @param   {string}                         dataId            Optional identifier of the external data item
         * @param   {number}                         visualParentId    Optional identifier of the box that should be parent of this one in the chart
         * @return  {Staffer.OrgChart.Layout.Box}                      Newly created Box object
         */
        addBox: function (dataId, visualParentId) {
            return this.addBox$1(dataId, this.nextBoxId(), visualParentId);
        },
        addBox$1: function (dataId, id, visualParentId) {
            var box = new Staffer.OrgChart.Layout.Box.ctor(dataId, id, visualParentId);
            this.m_boxesById.add(box.id, box);
            if (!System.String.isNullOrEmpty(dataId)) {
                this.m_boxesByDataId.add(box.dataId, box);
            }

            return box;
        },
        /**
         * Generates a new identifier for a {@link }.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.BoxContainer
         * @memberof Staffer.OrgChart.Layout.BoxContainer
         * @return  {number}
         */
        nextBoxId: function () {
            this.m_lastBoxId = (this.m_lastBoxId + 1) | 0;
            return this.m_lastBoxId;
        }
    });

    /**
     * Alignment of a parent box above children nodes.
     *
     * @public
     * @class Staffer.OrgChart.Layout.BranchParentAlignment
     */
    Bridge.define("Staffer.OrgChart.Layout.BranchParentAlignment", {
        $kind: "enum",
        statics: {
            /**
             * Default value is invalid, do not use it.
             *
             * @static
             * @public
             * @memberof Staffer.OrgChart.Layout.BranchParentAlignment
             * @constant
             * @default 0
             * @type Staffer.OrgChart.Layout.BranchParentAlignment
             */
            InvalidValue: 0,
            /**
             * Put parent on the left side of children.
             *
             * @static
             * @public
             * @memberof Staffer.OrgChart.Layout.BranchParentAlignment
             * @constant
             * @default 1
             * @type Staffer.OrgChart.Layout.BranchParentAlignment
             */
            Left: 1,
            /**
             * Put parent in the middle above children.
             *
             * @static
             * @public
             * @memberof Staffer.OrgChart.Layout.BranchParentAlignment
             * @constant
             * @default 2
             * @type Staffer.OrgChart.Layout.BranchParentAlignment
             */
            Center: 2,
            /**
             * Put parent on the right side of children.
             *
             * @static
             * @public
             * @memberof Staffer.OrgChart.Layout.BranchParentAlignment
             * @constant
             * @default 3
             * @type Staffer.OrgChart.Layout.BranchParentAlignment
             */
            Right: 3
        }
    });

    /**
     * A visual connector between two or more objects.
     *
     * @public
     * @class Staffer.OrgChart.Layout.Connector
     */
    Bridge.define("Staffer.OrgChart.Layout.Connector", {
        config: {
            properties: {
                /**
                 * All individual segments of a connector, sorted from beginning to end.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.Connector
                 * @memberof Staffer.OrgChart.Layout.Connector
                 * @function getSegments
                 * @return  {Array.<Staffer.OrgChart.Layout.Edge>}
                 */
                /**
                 * All individual segments of a connector, sorted from beginning to end.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Layout.Connector
                 * @memberof Staffer.OrgChart.Layout.Connector
                 * @function setSegments
                 * @param   {Array.<Staffer.OrgChart.Layout.Edge>}    value
                 * @return  {void}
                 */
                Segments: null
            }
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Connector
         * @memberof Staffer.OrgChart.Layout.Connector
         * @param   {Array.<Staffer.OrgChart.Layout.Edge>}    segments
         * @return  {void}
         */
        ctor: function (segments) {
            this.$initialize();
            if (segments.length === 0) {
                throw new System.ArgumentException("Need at least one segment", "segments");
            }
            this.setSegments(segments);
        }
    });

    /**
     * A collection of {@link } and {@link } objects.
     *
     * @public
     * @class Staffer.OrgChart.Layout.Diagram
     */
    Bridge.define("Staffer.OrgChart.Layout.Diagram", {
        m_visualTree: null,
        m_boxes: null,
        config: {
            properties: {
                /**
                 * Diagram layout styles.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.Diagram
                 * @memberof Staffer.OrgChart.Layout.Diagram
                 * @function getLayoutSettings
                 * @return  {Staffer.OrgChart.Layout.DiagramLayoutSettings}
                 */
                /**
                 * Diagram layout styles.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Layout.Diagram
                 * @memberof Staffer.OrgChart.Layout.Diagram
                 * @function setLayoutSettings
                 * @param   {Staffer.OrgChart.Layout.DiagramLayoutSettings}    value
                 * @return  {void}
                 */
                LayoutSettings: null
            }
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Diagram
         * @memberof Staffer.OrgChart.Layout.Diagram
         * @return  {void}
         */
        ctor: function () {
            this.$initialize();
            this.setLayoutSettings(new Staffer.OrgChart.Layout.DiagramLayoutSettings());
        },
        /**
         * All boxes. If modified, resets {@link } to <pre><code>null</code></pre>.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Diagram
         * @memberof Staffer.OrgChart.Layout.Diagram
         * @function getBoxes
         * @return  {Staffer.OrgChart.Layout.BoxContainer}
         */
        /**
         * All boxes. If modified, resets {@link } to <pre><code>null</code></pre>.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Diagram
         * @memberof Staffer.OrgChart.Layout.Diagram
         * @function setBoxes
         * @param   {Staffer.OrgChart.Layout.BoxContainer}    value
         * @return  {void}
         */
        getBoxes: function () {
            return this.m_boxes;
        },
        /**
         * All boxes. If modified, resets {@link } to <pre><code>null</code></pre>.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Diagram
         * @memberof Staffer.OrgChart.Layout.Diagram
         * @function getBoxes
         * @return  {Staffer.OrgChart.Layout.BoxContainer}
         */
        /**
         * All boxes. If modified, resets {@link } to <pre><code>null</code></pre>.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Diagram
         * @memberof Staffer.OrgChart.Layout.Diagram
         * @function setBoxes
         * @param   {Staffer.OrgChart.Layout.BoxContainer}    value
         * @return  {void}
         */
        setBoxes: function (value) {
            this.m_visualTree = null;
            this.m_boxes = value;
        },
        /**
         * Visual tree of boxes.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Diagram
         * @memberof Staffer.OrgChart.Layout.Diagram
         * @function getVisualTree
         * @return  {Staffer.OrgChart.Misc.Tree$3}
         */
        /**
         * Visual tree of boxes.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Diagram
         * @memberof Staffer.OrgChart.Layout.Diagram
         * @function setVisualTree
         * @param   {Staffer.OrgChart.Misc.Tree$3}    value
         * @return  {void}
         */
        getVisualTree: function () {
            return this.m_visualTree;
        },
        /**
         * Visual tree of boxes.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Diagram
         * @memberof Staffer.OrgChart.Layout.Diagram
         * @function getVisualTree
         * @return  {Staffer.OrgChart.Misc.Tree$3}
         */
        /**
         * Visual tree of boxes.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Diagram
         * @memberof Staffer.OrgChart.Layout.Diagram
         * @function setVisualTree
         * @param   {Staffer.OrgChart.Misc.Tree$3}    value
         * @return  {void}
         */
        setVisualTree: function (value) {
            this.m_visualTree = value;
        }
    });

    /**
     * Layout settings bound per-frame.
     *
     * @public
     * @class Staffer.OrgChart.Layout.DiagramLayoutSettings
     */
    Bridge.define("Staffer.OrgChart.Layout.DiagramLayoutSettings", {
        m_branchSpacing: 0,
        config: {
            properties: {
                /**
                 * All unique layout strategies (semantically similar to CSS style sheets) referenced by sub-trees in the diagram.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @function getLayoutStrategies
                 * @return  {System.Collections.Generic.Dictionary$2}
                 */
                /**
                 * All unique layout strategies (semantically similar to CSS style sheets) referenced by sub-trees in the diagram.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @function setLayoutStrategies
                 * @param   {System.Collections.Generic.Dictionary$2}    value
                 * @return  {void}
                 */
                LayoutStrategies: null,
                /**
                 * Optional explicitly specified default layout strategy to use for root boxes with {@link } set to <pre><code>null</code></pre>.
                 If <pre><code>null</code></pre> or invalid, {@link } will throw up.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @function getDefaultLayoutStrategyId
                 * @return  {string}
                 */
                /**
                 * Optional explicitly specified default layout strategy to use for root boxes with {@link } set to <pre><code>null</code></pre>.
                 If <pre><code>null</code></pre> or invalid, {@link } will throw up.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @function setDefaultLayoutStrategyId
                 * @param   {string}    value
                 * @return  {void}
                 */
                DefaultLayoutStrategyId: null,
                /**
                 * A margin to add on top and under each box, to prevent edges from coming too close to each other.
                 Normally, branch connector spacers prevent most of such visual effects,
                 but it is still possible to have one box almost touching another when there's no other cushion around it.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @function getBoxVerticalMargin
                 * @return  {number}
                 */
                /**
                 * A margin to add on top and under each box, to prevent edges from coming too close to each other.
                 Normally, branch connector spacers prevent most of such visual effects,
                 but it is still possible to have one box almost touching another when there's no other cushion around it.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
                 * @function setBoxVerticalMargin
                 * @param   {number}    value
                 * @return  {void}
                 */
                BoxVerticalMargin: 0
            }
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @return  {void}
         */
        ctor: function () {
            this.$initialize();
            this.setBranchSpacing(50);
            this.setBoxVerticalMargin(5);
            this.setLayoutStrategies(new (System.Collections.Generic.Dictionary$2(String,Staffer.OrgChart.Layout.LayoutStrategyBase))());
        },
        /**
         * Minimum space between boxes that belong to different branches.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @function getBranchSpacing
         * @return  {number}
         */
        /**
         * Minimum space between boxes that belong to different branches.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @function setBranchSpacing
         * @param   {number}    value
         * @return  {void}
         */
        getBranchSpacing: function () {
            return this.m_branchSpacing;
        },
        /**
         * Minimum space between boxes that belong to different branches.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @function getBranchSpacing
         * @return  {number}
         */
        /**
         * Minimum space between boxes that belong to different branches.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @function setBranchSpacing
         * @param   {number}    value
         * @return  {void}
         */
        setBranchSpacing: function (value) {
            if (value < 0) {
                throw new System.ArgumentOutOfRangeException("value", "Cannot be negative", null, value);
            }
            this.m_branchSpacing = value;
        },
        /**
         * Layout strategy to be used for root boxes with {@link } set to <pre><code>null</code></pre>.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @memberof Staffer.OrgChart.Layout.DiagramLayoutSettings
         * @throws {@link InvalidOperationException} is null or not valid
         * @return  {Staffer.OrgChart.Layout.LayoutStrategyBase}
         */
        requireDefaultLayoutStrategy: function () {
            var result = { };
            if (System.String.isNullOrEmpty(this.getDefaultLayoutStrategyId()) || !this.getLayoutStrategies().tryGetValue(this.getDefaultLayoutStrategyId(), result)) {
                throw new System.InvalidOperationException("defaultLayoutStrategyId is null or not valid");
            }

            return result.v;
        }
    });

    /**
     * Template layout settings that can be referenced by {@link }.
     *
     * @public
     * @class Staffer.OrgChart.Layout.DiagramLayoutTemplates
     */
    Bridge.define("Staffer.OrgChart.Layout.DiagramLayoutTemplates");

    /**
     * Edges of a bunch of siblings on vertical or horizontal axis.
     *
     * @public
     * @class Staffer.OrgChart.Layout.Dimensions
     */
    Bridge.define("Staffer.OrgChart.Layout.Dimensions", {
        $kind: "struct",
        statics: {
            /**
             * Ctr.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.Dimensions
             * @memberof Staffer.OrgChart.Layout.Dimensions
             * @return  {Staffer.OrgChart.Layout.Dimensions}
             */
            minMax: function () {
                return new Staffer.OrgChart.Layout.Dimensions.$ctor1(System.Double.max, System.Double.min);
            }/**
             * Computes combined dimension.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.Dimensions
             * @memberof Staffer.OrgChart.Layout.Dimensions
             * @param   {Staffer.OrgChart.Layout.Dimensions}    x    
             * @param   {Staffer.OrgChart.Layout.Dimensions}    y
             * @return  {Staffer.OrgChart.Layout.Dimensions}
             */
            ,
            op_Addition: function (x, y) {
                return new Staffer.OrgChart.Layout.Dimensions.$ctor1(Math.min(x.from, y.from), Math.max(x.to, y.to));
            },
            getDefaultValue: function () { return new Staffer.OrgChart.Layout.Dimensions(); }
        },
        /**
         * Min value.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Dimensions
         * @type number
         */
        from: 0,
        /**
         * Max value.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Dimensions
         * @type number
         */
        to: 0,
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Dimensions
         * @memberof Staffer.OrgChart.Layout.Dimensions
         * @param   {number}    from    
         * @param   {number}    to
         * @return  {void}
         */
        $ctor1: function (from, to) {
            this.$initialize();
            this.from = from;
            this.to = to;
        },
        ctor: function () {
            this.$initialize();
        },
        getHashCode: function () {
            var h = Bridge.addHash([3570880544, this.from, this.to]);
            return h;
        },
        equals: function (o) {
            if (!Bridge.is(o, Staffer.OrgChart.Layout.Dimensions)) {
                return false;
            }
            return Bridge.equals(this.from, o.from) && Bridge.equals(this.to, o.to);
        },
        $clone: function (to) { return this; }
    });

    /**
     * An edge in the diagram logical coordinate space.
     *
     * @public
     * @class Staffer.OrgChart.Layout.Edge
     */
    Bridge.define("Staffer.OrgChart.Layout.Edge", {
        $kind: "struct",
        statics: {
            getDefaultValue: function () { return new Staffer.OrgChart.Layout.Edge(); }
        },
        config: {
            init: function () {
                this.from = new Staffer.OrgChart.Layout.Point();
                this.to = new Staffer.OrgChart.Layout.Point();
            }
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Edge
         * @memberof Staffer.OrgChart.Layout.Edge
         * @param   {Staffer.OrgChart.Layout.Point}    from    
         * @param   {Staffer.OrgChart.Layout.Point}    to
         * @return  {void}
         */
        $ctor1: function (from, to) {
            this.$initialize();
            this.from = from;
            this.to = to;
        },
        ctor: function () {
            this.$initialize();
        },
        getHashCode: function () {
            var h = Bridge.addHash([1701274693, this.from, this.to]);
            return h;
        },
        equals: function (o) {
            if (!Bridge.is(o, Staffer.OrgChart.Layout.Edge)) {
                return false;
            }
            return Bridge.equals(this.from, o.from) && Bridge.equals(this.to, o.to);
        },
        $clone: function (to) { return this; }
    });

    /**
     * A rectangular frame in the diagram logical coordinate space,
     with its shape and connectors.
     *
     * @public
     * @class Staffer.OrgChart.Layout.Frame
     */
    Bridge.define("Staffer.OrgChart.Layout.Frame", {
        /**
         * Connectors to dependent objects.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.Frame
         * @type Staffer.OrgChart.Layout.Connector
         */
        connector: null,
        config: {
            init: function () {
                this.exterior = new Staffer.OrgChart.Layout.Rect();
                this.branchExterior = new Staffer.OrgChart.Layout.Rect();
                this.siblingsRowV = new Staffer.OrgChart.Layout.Dimensions();
            }
        },
        /**
         * Resets content to start a fresh layout.
         Does not modify size of the {@link }.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Frame
         * @memberof Staffer.OrgChart.Layout.Frame
         * @return  {void}
         */
        resetLayout: function () {
            this.exterior = new Staffer.OrgChart.Layout.Rect.$ctor1(new Staffer.OrgChart.Layout.Point.ctor(), this.exterior.size);
            this.branchExterior = this.exterior;
            this.connector = null;
            this.siblingsRowV = Staffer.OrgChart.Layout.Dimensions.minMax();
        }
    });

    /**
     * Access to underlying data.
     *
     * @abstract
     * @public
     * @class Staffer.OrgChart.Layout.IChartDataSource
     */
    Bridge.define("Staffer.OrgChart.Layout.IChartDataSource", {
        $kind: "interface"
    });

    /**
     * Applies layout.
     *
     * @static
     * @abstract
     * @public
     * @class Staffer.OrgChart.Layout.LayoutAlgorithm
     */
    Bridge.define("Staffer.OrgChart.Layout.LayoutAlgorithm", {
        statics: {
            /**
             * Computes bounding rectangle in diagram space using only visible (non-autogenerated boxes).
             Useful for rendering the chart, as boxes frequently go into negative side horizontally, and have a special root box on top - all of those should not be accounted for.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.LayoutAlgorithm
             * @memberof Staffer.OrgChart.Layout.LayoutAlgorithm
             * @param   {Staffer.OrgChart.Misc.Tree$3}    visualTree
             * @return  {Staffer.OrgChart.Layout.Rect}
             */
            computeBranchVisualBoundingRect: function (visualTree) {
                var result = new Staffer.OrgChart.Layout.Rect.ctor();
                var initialized = false;

                Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo).iterateParentFirst(visualTree.getRoots().getItem(0), function (node) {
                    var box = node.getElement();

                    if (box.affectsLayout && !box.isSpecial) {
                        if (initialized) {
                            result = Staffer.OrgChart.Layout.Rect.op_Addition(result, box.frame.exterior);
                        } else {
                            initialized = true;
                            result = box.frame.exterior;
                        }
                    }

                    return !box.isCollapsed;
                });

                return result;
            },
            /**
             * Resets chart layout-related properties on boxes, possibly present from previous layout runs.
             Wipes out connectors too.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.LayoutAlgorithm
             * @memberof Staffer.OrgChart.Layout.LayoutAlgorithm
             * @param   {Staffer.OrgChart.Layout.Diagram}    diagram
             * @return  {void}
             */
            resetBoxPositions: function (diagram) {
                var $t;
                $t = Bridge.getEnumerator(diagram.getBoxes().getBoxesById().System$Collections$Generic$IDictionary$2$System$Int32$Staffer$OrgChart$Layout$Box$getValues(), "System$Collections$Generic$IEnumerable$1$Staffer$OrgChart$Layout$Box$getEnumerator");
                while ($t.moveNext()) {
                    var box = $t.getCurrent();
                    box.frame.resetLayout();
                }
            },
            /**
             * Initializes <b /> and performs all layout operations.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.LayoutAlgorithm
             * @memberof Staffer.OrgChart.Layout.LayoutAlgorithm
             * @param   {Staffer.OrgChart.Layout.LayoutState}    state
             * @return  {void}
             */
            apply: function (state) {
                var $t;
                // verify the root
                if (state.getDiagram().getBoxes().getSystemRoot() == null) {
                    throw new System.InvalidOperationException("SystemRoot is not initialized on the box container");
                }

                state.setCurrentOperation(Staffer.OrgChart.Layout.LayoutState.Operation.Preparing);

                var tree = Staffer.OrgChart.Misc.Tree$3(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo).build(state.getDiagram().getBoxes().getBoxesById().System$Collections$Generic$IDictionary$2$System$Int32$Staffer$OrgChart$Layout$Box$getValues(), $_.Staffer.OrgChart.Layout.LayoutAlgorithm.f1, $_.Staffer.OrgChart.Layout.LayoutAlgorithm.f2);

                // verify the root
                if (tree.getRoots().getCount() !== 1 || tree.getRoots().getItem(0).getElement().id !== state.getDiagram().getBoxes().getSystemRoot().id) {
                    throw new System.Exception("SystemRoot is not on the top of the visual tree");
                }

                // set the tree and update visibility
                tree.updateHierarchyStats();
                state.attachVisualTree(tree);

                if (!Bridge.staticEquals(state.getBoxSizeFunc(), null)) {
                    // apply box sizes
                    $t = Bridge.getEnumerator(System.Linq.Enumerable.from(state.getDiagram().getBoxes().getBoxesById().System$Collections$Generic$IDictionary$2$System$Int32$Staffer$OrgChart$Layout$Box$getValues()).where($_.Staffer.OrgChart.Layout.LayoutAlgorithm.f3));
                    while ($t.moveNext()) {
                        var box = $t.getCurrent();
                        box.frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor2(state.getBoxSizeFunc()(box.dataId));
                    }
                }

                // update visibility of boxes based on collapsed state
                tree.iterateParentFirst($_.Staffer.OrgChart.Layout.LayoutAlgorithm.f4);

                state.setCurrentOperation(Staffer.OrgChart.Layout.LayoutState.Operation.PreprocessVisualTree);
                Staffer.OrgChart.Layout.LayoutAlgorithm.preprocessVisualTree(state, tree);

                state.setCurrentOperation(Staffer.OrgChart.Layout.LayoutState.Operation.VerticalLayout);
                Staffer.OrgChart.Layout.LayoutAlgorithm.verticalLayout(state, tree.getRoots().getItem(0));

                state.setCurrentOperation(Staffer.OrgChart.Layout.LayoutState.Operation.HorizontalLayout);
                Staffer.OrgChart.Layout.LayoutAlgorithm.horizontalLayout(state, tree.getRoots().getItem(0));

                state.setCurrentOperation(Staffer.OrgChart.Layout.LayoutState.Operation.ConnectorsLayout);
                Staffer.OrgChart.Layout.LayoutAlgorithm.routeConnectors(state);

                state.getDiagram().setVisualTree(state.getVisualTree());

                state.setCurrentOperation(Staffer.OrgChart.Layout.LayoutState.Operation.Completed);
            },
            preprocessVisualTree: function (state, visualTree) {
                visualTree.iterateParentFirst(function (node) {
                    if (node.getElement().isSpecial && node.getLevel() > 0) {
                        return false;
                    }

                    // first, find and associate layout strategy in effect for this node
                    if (node.getElement().layoutStrategyId != null) {
                        // is it explicitly specified?
                        node.getState().setEffectiveLayoutStrategy(state.getDiagram().getLayoutSettings().getLayoutStrategies().get(node.getElement().layoutStrategyId));
                    } else if (node.getParentNode() != null) {
                        // can we inherit it from previous level?
                        node.getState().setEffectiveLayoutStrategy(node.getParentNode().getState().requireLayoutStrategy());
                    } else {
                        node.getState().setEffectiveLayoutStrategy(state.getDiagram().getLayoutSettings().requireDefaultLayoutStrategy());
                    }

                    // now let it pre-allocate special boxes etc
                    node.getState().requireLayoutStrategy().preProcessThisNode(state, node);

                    return !node.getElement().isCollapsed && node.getChildCount() > 0;
                });
            },
            /**
             * Re-entrant layout algorithm,
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.LayoutAlgorithm
             * @memberof Staffer.OrgChart.Layout.LayoutAlgorithm
             * @param   {Staffer.OrgChart.Layout.LayoutState}      state         
             * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    branchRoot
             * @return  {void}
             */
            horizontalLayout: function (state, branchRoot) {
                if (!branchRoot.getElement().affectsLayout) {
                    throw new System.InvalidOperationException(System.String.format("Branch root {0} does not affect layout", branchRoot.getElement().id));
                }

                var level = state.pushLayoutLevel(branchRoot);
                try {
                    if (branchRoot.getState().numberOfSiblings > 0 && !branchRoot.getElement().isCollapsed) {
                        branchRoot.getState().requireLayoutStrategy().applyHorizontalLayout(state, level);
                    }
                }
                finally {
                    state.popLayoutLevel();
                }
            },
            /**
             * Re-entrant layout algorithm.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.LayoutAlgorithm
             * @memberof Staffer.OrgChart.Layout.LayoutAlgorithm
             * @param   {Staffer.OrgChart.Layout.LayoutState}      state         
             * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    branchRoot
             * @return  {void}
             */
            verticalLayout: function (state, branchRoot) {
                if (!branchRoot.getElement().affectsLayout) {
                    throw new System.InvalidOperationException(System.String.format("Branch root {0} does not affect layout", branchRoot.getElement().id));
                }

                var level = state.pushLayoutLevel(branchRoot);
                try {
                    if (branchRoot.getState().numberOfSiblings > 0 && !branchRoot.getElement().isCollapsed) {
                        branchRoot.getState().requireLayoutStrategy().applyVerticalLayout(state, level);
                    }
                }
                finally {
                    state.popLayoutLevel();
                }
            },
            routeConnectors: function (state) {
                if (state.getVisualTree() == null) {
                    throw new System.InvalidOperationException("Visual tree not attached");
                }

                state.getVisualTree().iterateParentFirst(function (node) {
                    if (node.getElement().isCollapsed || node.getState().numberOfSiblings === 0) {
                        return false;
                    }

                    if (node.getLevel() === 0) {
                        return true;
                    }

                    if (!node.getElement().isSpecial) {
                        node.getState().requireLayoutStrategy().routeConnectors(state, node);
                        return true;
                    }

                    return false;
                });
            },
            /**
             * Moves a given branch horizontally, except its root box.
             Also updates branch exterior rects.
             Also updates branch boundary for the current <b />.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.LayoutAlgorithm
             * @memberof Staffer.OrgChart.Layout.LayoutAlgorithm
             * @param   {Staffer.OrgChart.Layout.LayoutState}                state          
             * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    layoutLevel    
             * @param   {number}                                             offset
             * @return  {void}
             */
            moveChildrenOnly: function (state, layoutLevel, offset) {
                var $t;
                var children = layoutLevel.branchRoot.getChildren();
                if (children == null || System.Array.getCount(children, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)) === 0) {
                    throw new System.InvalidOperationException("Should never be invoked when children not set");
                }

                $t = Bridge.getEnumerator(children, "System$Collections$Generic$IEnumerable$1$Staffer$OrgChart$Misc$Tree$3$TreeNode$System$Int32$Staffer$OrgChart$Layout$Box$Staffer$OrgChart$Layout$NodeLayoutInfo$getEnumerator");
                while ($t.moveNext()) {
                    (function () {
                        var child = $t.getCurrent();
                        Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo).iterateChildFirst(child, function (node) {
                            if (node.getElement().affectsLayout) {
                                node.getElement().frame.exterior = node.getElement().frame.exterior.moveH(offset);
                                node.getElement().frame.branchExterior = node.getElement().frame.branchExterior.moveH(offset);
                            }
                            return true;
                        });
                    }).call(this);
                }

                layoutLevel.boundary.reloadFromBranch(layoutLevel.branchRoot);
                layoutLevel.branchRoot.getElement().frame.branchExterior = layoutLevel.boundary.getBoundingRect();
            },
            /**
             * Moves a given branch horizontally, except its root box.
             Also updates branch exterior rects.
             Unlike {@link } and {@link }, does NOT update the boundary.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.LayoutAlgorithm
             * @memberof Staffer.OrgChart.Layout.LayoutAlgorithm
             * @param   {Staffer.OrgChart.Layout.LayoutState}      state     
             * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    root      
             * @param   {number}                                   offset
             * @return  {void}
             */
            moveOneChild: function (state, root, offset) {
                Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo).iterateChildFirst(root, function (node) {
                    if (node.getElement().affectsLayout) {
                        node.getElement().frame.exterior = node.getElement().frame.exterior.moveH(offset);
                        node.getElement().frame.branchExterior = node.getElement().frame.branchExterior.moveH(offset);
                    }
                    return true;
                });
            },
            /**
             * Moves a given branch horizontally, including its root box.
             Also updates branch exterior rects.
             Also updates branch boundary for the current <b />.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.LayoutAlgorithm
             * @memberof Staffer.OrgChart.Layout.LayoutAlgorithm
             * @param   {Staffer.OrgChart.Layout.LayoutState}                state          
             * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    layoutLevel    
             * @param   {number}                                             offset
             * @return  {void}
             */
            moveBranch: function (state, layoutLevel, offset) {
                Staffer.OrgChart.Layout.LayoutAlgorithm.moveOneChild(state, layoutLevel.branchRoot, offset);
                layoutLevel.boundary.reloadFromBranch(layoutLevel.branchRoot);
                layoutLevel.branchRoot.getElement().frame.branchExterior = layoutLevel.boundary.getBoundingRect();
            },
            /**
             * Vertically aligns a subset of child nodes, presumably located one above another.
             All children must belong to the current layout level's root.
             Returns leftmost and rightmost boundaries of all branches in the <b />, after alignment.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.LayoutAlgorithm
             * @memberof Staffer.OrgChart.Layout.LayoutAlgorithm
             * @param   {Staffer.OrgChart.Layout.LayoutState}                state     
             * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    level     
             * @param   {System.Collections.Generic.IEnumerable$1}           subset
             * @return  {Staffer.OrgChart.Layout.Dimensions}
             */
            alignHorizontalCenters: function (state, level, subset) {
                var $t, $t1;
                // compute the rightmost center in the column
                var center = System.Double.min;
                $t = Bridge.getEnumerator(subset, null, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                while ($t.moveNext()) {
                    var child = $t.getCurrent();
                    var c = child.getElement().frame.exterior.getCenterH();
                    if (c > center) {
                        center = c;
                    }
                }

                // move those boxes in the column that are not aligned with the rightmost center
                var leftmost = System.Double.max;
                var rightmost = System.Double.min;
                $t1 = Bridge.getEnumerator(subset, null, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                while ($t1.moveNext()) {
                    var child1 = $t1.getCurrent();
                    var frame = child1.getElement().frame;
                    var c1 = frame.exterior.getCenterH();
                    if (c1 !== center) {
                        var diff = center - c1;
                        Staffer.OrgChart.Layout.LayoutAlgorithm.moveOneChild(state, child1, diff);
                    }
                    leftmost = Math.min(leftmost, child1.getElement().frame.branchExterior.getLeft());
                    rightmost = Math.max(rightmost, child1.getElement().frame.branchExterior.getRight());
                }

                // update branch boundary
                level.boundary.reloadFromBranch(level.branchRoot);

                return new Staffer.OrgChart.Layout.Dimensions.$ctor1(leftmost, rightmost);
            }
        }
    });

    var $_ = {};

    Bridge.ns("Staffer.OrgChart.Layout.LayoutAlgorithm", $_);

    Bridge.apply($_.Staffer.OrgChart.Layout.LayoutAlgorithm, {
        f1: function (x) {
            return x.id;
        },
        f2: function (x) {
            return x.visualParentId;
        },
        f3: function (x) {
            return x.getIsDataBound();
        },
        f4: function (node) {
            node.getElement().affectsLayout = node.getParentNode() == null || node.getParentNode().getElement().affectsLayout && !node.getParentNode().getElement().isCollapsed;
            return true;
        }
    });

    /**
     * Holds state for a particular layout operation, 
     such as reference to the {@link }, current stack of boundaries etc.
     *
     * @public
     * @class Staffer.OrgChart.Layout.LayoutState
     */
    Bridge.define("Staffer.OrgChart.Layout.LayoutState", {
        /**
         * Stack of the layout roots, as algorithm proceeds in depth-first fashion.
         Every box has a {@link } object associated with it, to keep track of corresponding visual tree's edges.
         *
         * @instance
         * @private
         * @readonly
         * @memberof Staffer.OrgChart.Layout.LayoutState
         * @type System.Collections.Generic.Stack$1
         */
        m_layoutStack: null,
        /**
         * Pool of currently-unused {@link } objects. They are added and removed here as they are taken for use in {@link }.
         *
         * @instance
         * @private
         * @readonly
         * @memberof Staffer.OrgChart.Layout.LayoutState
         * @type System.Collections.Generic.List$1
         */
        m_pooledBoundaries: null,
        m_currentOperation: 0,
        config: {
            events: {
                /**
                 * Gets fired when any {@link } is modified by methods of this object.
                 *
                 * @instance
                 * @public
                 * @memberof Staffer.OrgChart.Layout.LayoutState
                 * @event Staffer.OrgChart.Layout.LayoutState#BoundaryChanged
                 * @return  {System.EventHandler}
                 */
                BoundaryChanged: null,
                /**
                 * Gets fired when {@link } is changed on this object.
                 *
                 * @instance
                 * @public
                 * @memberof Staffer.OrgChart.Layout.LayoutState
                 * @event Staffer.OrgChart.Layout.LayoutState#OperationChanged
                 * @return  {System.EventHandler}
                 */
                OperationChanged: null
            },
            properties: {
                /**
                 * Reference to the diagram for which a layout is being computed.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.LayoutState
                 * @memberof Staffer.OrgChart.Layout.LayoutState
                 * @function getDiagram
                 * @return  {Staffer.OrgChart.Layout.Diagram}
                 */
                /**
                 * Reference to the diagram for which a layout is being computed.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Layout.LayoutState
                 * @memberof Staffer.OrgChart.Layout.LayoutState
                 * @function setDiagram
                 * @param   {Staffer.OrgChart.Layout.Diagram}    value
                 * @return  {void}
                 */
                Diagram: null,
                /**
                 * Delegate that provides information about sizes of boxes.
                 First argument is the underlying data item id.
                 Return value is the size of the corresponding box.
                 This one should be implemented by the part of rendering engine that performs content layout inside a box.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.LayoutState
                 * @memberof Staffer.OrgChart.Layout.LayoutState
                 * @function getBoxSizeFunc
                 * @return  {System.Func}
                 */
                /**
                 * Delegate that provides information about sizes of boxes.
                 First argument is the underlying data item id.
                 Return value is the size of the corresponding box.
                 This one should be implemented by the part of rendering engine that performs content layout inside a box.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.LayoutState
                 * @memberof Staffer.OrgChart.Layout.LayoutState
                 * @function setBoxSizeFunc
                 * @param   {System.Func}    value
                 * @return  {void}
                 */
                BoxSizeFunc: null,
                /**
                 * Visual tree of boxes.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Layout.LayoutState
                 * @memberof Staffer.OrgChart.Layout.LayoutState
                 * @function getVisualTree
                 * @return  {Staffer.OrgChart.Misc.Tree$3}
                 */
                /**
                 * Visual tree of boxes.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Layout.LayoutState
                 * @memberof Staffer.OrgChart.Layout.LayoutState
                 * @function setVisualTree
                 * @param   {Staffer.OrgChart.Misc.Tree$3}    value
                 * @return  {void}
                 */
                VisualTree: null
            },
            init: function () {
                this.m_layoutStack = new (System.Collections.Generic.Stack$1(Staffer.OrgChart.Layout.LayoutState.LayoutLevel)).ctor();
                this.m_pooledBoundaries = new (System.Collections.Generic.List$1(Staffer.OrgChart.Layout.Boundary))();
            }
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.LayoutState
         * @memberof Staffer.OrgChart.Layout.LayoutState
         * @param   {Staffer.OrgChart.Layout.Diagram}    diagram
         * @return  {void}
         */
        ctor: function (diagram) {
            this.$initialize();
            this.setDiagram(diagram);
        },
        /**
         * Current operation in progress.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.LayoutState
         * @memberof Staffer.OrgChart.Layout.LayoutState
         * @function getCurrentOperation
         * @return  {number}
         */
        /**
         * Current operation in progress.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.LayoutState
         * @memberof Staffer.OrgChart.Layout.LayoutState
         * @function setCurrentOperation
         * @param   {number}    value
         * @return  {void}
         */
        getCurrentOperation: function () {
            return this.m_currentOperation;
        },
        /**
         * Current operation in progress.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.LayoutState
         * @memberof Staffer.OrgChart.Layout.LayoutState
         * @function getCurrentOperation
         * @return  {number}
         */
        /**
         * Current operation in progress.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.LayoutState
         * @memberof Staffer.OrgChart.Layout.LayoutState
         * @function setCurrentOperation
         * @param   {number}    value
         * @return  {void}
         */
        setCurrentOperation: function (value) {
            this.m_currentOperation = value;
            !Bridge.staticEquals(this.OperationChanged, null) ? this.OperationChanged(this, new Staffer.OrgChart.Layout.LayoutStateOperationChangedEventArgs(this)) : null;
        },
        /**
         * Initializes the visual tree and pool of boundary objects.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.LayoutState
         * @memberof Staffer.OrgChart.Layout.LayoutState
         * @param   {Staffer.OrgChart.Misc.Tree$3}    tree
         * @return  {void}
         */
        attachVisualTree: function (tree) {
            if (this.getVisualTree() != null) {
                throw new System.InvalidOperationException("Already initialized");
            }

            this.setVisualTree(tree);
            for (var i = 0; i < tree.getDepth(); i = (i + 1) | 0) {
                this.m_pooledBoundaries.add(new Staffer.OrgChart.Layout.Boundary.$ctor1(this.getDiagram().getLayoutSettings().getBoxVerticalMargin()));
            }
        },
        /**
         * Push a new box onto the layout stack, thus getting deeper into layout hierarchy.
         Automatically allocates a Bondary object from pool.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.LayoutState
         * @memberof Staffer.OrgChart.Layout.LayoutState
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}              node
         * @return  {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}
         */
        pushLayoutLevel: function (node) {
            if (this.m_pooledBoundaries.getCount() === 0) {
                //throw new InvalidOperationException("Hierarchy is deeper than expected");
                this.m_pooledBoundaries.add(new Staffer.OrgChart.Layout.Boundary.$ctor1(this.getDiagram().getLayoutSettings().getBoxVerticalMargin()));
            }

            var boundary = this.m_pooledBoundaries.getItem(((this.m_pooledBoundaries.getCount() - 1) | 0));
            this.m_pooledBoundaries.removeAt(((this.m_pooledBoundaries.getCount() - 1) | 0));

            switch (this.getCurrentOperation()) {
                case Staffer.OrgChart.Layout.LayoutState.Operation.VerticalLayout: 
                    boundary.prepare(node.getElement());
                    break;
                case Staffer.OrgChart.Layout.LayoutState.Operation.HorizontalLayout: 
                    boundary.prepareForHorizontalLayout(node.getElement());
                    break;
                default: 
                    throw new System.InvalidOperationException("This operation can only be invoked when performing vertical or horizontal layouts");
            }

            var result = new Staffer.OrgChart.Layout.LayoutState.LayoutLevel.$ctor1(node, boundary);
            this.m_layoutStack.push(result);
            !Bridge.staticEquals(this.BoundaryChanged, null) ? this.BoundaryChanged(this, new Staffer.OrgChart.Layout.BoundaryChangedEventArgs(boundary, result, this)) : null;

            return result;
        },
        /**
         * Merges a provided spacer box into the current branch boundary.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.LayoutState
         * @memberof Staffer.OrgChart.Layout.LayoutState
         * @param   {Staffer.OrgChart.Layout.Box}    spacerBox
         * @return  {void}
         */
        mergeSpacer: function (spacerBox) {
            if (this.getCurrentOperation() !== Staffer.OrgChart.Layout.LayoutState.Operation.HorizontalLayout) {
                throw new System.InvalidOperationException("Spacers can only be merged during horizontal layout");
            }

            if (this.m_layoutStack.getCount() === 0) {
                throw new System.InvalidOperationException("Cannot merge spacers at top nesting level");
            }

            var level = this.m_layoutStack.peek();
            level.boundary.mergeFrom$1(spacerBox);
            !Bridge.staticEquals(this.BoundaryChanged, null) ? this.BoundaryChanged(this, new Staffer.OrgChart.Layout.BoundaryChangedEventArgs(level.boundary, level, this)) : null;
        },
        /**
         * Pops a box from current layout stack, thus getting higher out from layout hierarchy.
         Automatically merges corresponding popped {@link } into the new-leaf level.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.LayoutState
         * @memberof Staffer.OrgChart.Layout.LayoutState
         * @return  {void}
         */
        popLayoutLevel: function () {
            var innerLevel = this.m_layoutStack.pop();
            !Bridge.staticEquals(this.BoundaryChanged, null) ? this.BoundaryChanged(this, new Staffer.OrgChart.Layout.BoundaryChangedEventArgs(innerLevel.boundary, innerLevel, this)) : null;

            // if this was not the root, merge boundaries into current level
            if (this.m_layoutStack.getCount() > 0) {
                var higherLevel = this.m_layoutStack.peek();

                switch (this.getCurrentOperation()) {
                    case Staffer.OrgChart.Layout.LayoutState.Operation.VerticalLayout: 
                        higherLevel.boundary.verticalMergeFrom(innerLevel.boundary);
                        higherLevel.branchRoot.getElement().frame.branchExterior = higherLevel.boundary.getBoundingRect();
                        break;
                    case Staffer.OrgChart.Layout.LayoutState.Operation.HorizontalLayout: 
                        {
                            var strategy = higherLevel.branchRoot.getState().requireLayoutStrategy();

                            var overlap = higherLevel.boundary.computeOverlap(innerLevel.boundary, strategy.siblingSpacing, this.getDiagram().getLayoutSettings().getBranchSpacing());

                            if (overlap > 0) {
                                Staffer.OrgChart.Layout.LayoutAlgorithm.moveBranch(this, innerLevel, overlap);
                                !Bridge.staticEquals(this.BoundaryChanged, null) ? this.BoundaryChanged(this, new Staffer.OrgChart.Layout.BoundaryChangedEventArgs(innerLevel.boundary, innerLevel, this)) : null;
                            }

                            higherLevel.boundary.mergeFrom(innerLevel.boundary);
                            higherLevel.branchRoot.getElement().frame.branchExterior = higherLevel.boundary.getBoundingRect();
                        }
                        break;
                    default: 
                        throw new System.InvalidOperationException("This operation can only be invoked when performing vertical or horizontal layouts");
                }
                !Bridge.staticEquals(this.BoundaryChanged, null) ? this.BoundaryChanged(this, new Staffer.OrgChart.Layout.BoundaryChangedEventArgs(higherLevel.boundary, higherLevel, this)) : null;
            }

            // return boundary to the pool
            this.m_pooledBoundaries.add(innerLevel.boundary);
        }
    });

    /**
     * State of the layout operation for a particular sub-branch.
     *
     * @public
     * @class Staffer.OrgChart.Layout.LayoutState.LayoutLevel
     */
    Bridge.define("Staffer.OrgChart.Layout.LayoutState.LayoutLevel", {
        $kind: "struct",
        statics: {
            getDefaultValue: function () { return new Staffer.OrgChart.Layout.LayoutState.LayoutLevel(); }
        },
        /**
         * Root parent for this subtree.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.LayoutState.LayoutLevel
         * @type Staffer.OrgChart.Misc.Tree$3.TreeNode
         */
        branchRoot: null,
        /**
         * Boundaries of this entire subtree.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.LayoutState.LayoutLevel
         * @type Staffer.OrgChart.Layout.Boundary
         */
        boundary: null,
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.LayoutState.LayoutLevel
         * @memberof Staffer.OrgChart.Layout.LayoutState.LayoutLevel
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    node        
         * @param   {Staffer.OrgChart.Layout.Boundary}         boundary
         * @return  {void}
         */
        $ctor1: function (node, boundary) {
            this.$initialize();
            this.branchRoot = node;
            this.boundary = boundary;
        },
        ctor: function () {
            this.$initialize();
        },
        getHashCode: function () {
            var h = Bridge.addHash([3576838967, this.branchRoot, this.boundary]);
            return h;
        },
        equals: function (o) {
            if (!Bridge.is(o, Staffer.OrgChart.Layout.LayoutState.LayoutLevel)) {
                return false;
            }
            return Bridge.equals(this.branchRoot, o.branchRoot) && Bridge.equals(this.boundary, o.boundary);
        },
        $clone: function (to) { return this; }
    });

    /**
     * Current layout operation.
     *
     * @public
     * @class number
     */
    Bridge.define("Staffer.OrgChart.Layout.LayoutState.Operation", {
        $kind: "enum",
        statics: {
            /**
             * No op.
             *
             * @static
             * @public
             * @memberof number
             * @constant
             * @default 0
             * @type number
             */
            Idle: 0,
            /**
             * Making initial preparations, creating visual tree.
             *
             * @static
             * @public
             * @memberof number
             * @constant
             * @default 1
             * @type number
             */
            Preparing: 1,
            /**
             * Pre-layout modifications of the visual tree.
             *
             * @static
             * @public
             * @memberof number
             * @constant
             * @default 2
             * @type number
             */
            PreprocessVisualTree: 2,
            /**
             * Vertical layout in progress.
             *
             * @static
             * @public
             * @memberof number
             * @constant
             * @default 3
             * @type number
             */
            VerticalLayout: 3,
            /**
             * Horizontal layout in progress.
             *
             * @static
             * @public
             * @memberof number
             * @constant
             * @default 4
             * @type number
             */
            HorizontalLayout: 4,
            /**
             * Creating and positioning connectors.
             *
             * @static
             * @public
             * @memberof number
             * @constant
             * @default 5
             * @type number
             */
            ConnectorsLayout: 5,
            /**
             * All layout operations have been completed.
             *
             * @static
             * @public
             * @memberof number
             * @constant
             * @default 6
             * @type number
             */
            Completed: 6
        }
    });

    /**
     * Called when boundary is updated.
     *
     * @public
     * @class Staffer.OrgChart.Layout.LayoutStateOperationChangedEventArgs
     */
    Bridge.define("Staffer.OrgChart.Layout.LayoutStateOperationChangedEventArgs", {
        /**
         * Current layout state.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.LayoutStateOperationChangedEventArgs
         * @type Staffer.OrgChart.Layout.LayoutState
         */
        state: null,
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.LayoutStateOperationChangedEventArgs
         * @memberof Staffer.OrgChart.Layout.LayoutStateOperationChangedEventArgs
         * @param   {Staffer.OrgChart.Layout.LayoutState}    state
         * @return  {void}
         */
        ctor: function (state) {
            this.$initialize();
            this.state = state;
        }
    });

    /**
     * Base class for all chart layout strategies.
     *
     * @abstract
     * @public
     * @class Staffer.OrgChart.Layout.LayoutStrategyBase
     */
    Bridge.define("Staffer.OrgChart.Layout.LayoutStrategyBase", {
        /**
         * Alignment of the parent box above child boxes.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.LayoutStrategyBase
         * @type Staffer.OrgChart.Layout.BranchParentAlignment
         */
        parentAlignment: 0,
        /**
         * Minimum distance between a parent box and any child box.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.LayoutStrategyBase
         * @default 20
         * @type number
         */
        parentChildSpacing: 20,
        /**
         * Width of the area used to protect long vertical segments of connectors.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.LayoutStrategyBase
         * @default 50
         * @type number
         */
        parentConnectorShield: 50,
        /**
         * Minimum distance between two sibling boxes.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.LayoutStrategyBase
         * @default 20
         * @type number
         */
        siblingSpacing: 20,
        /**
         * Length of the small angled connector segment entering every child box.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.LayoutStrategyBase
         * @default 5
         * @type number
         */
        childConnectorHookLength: 5
    });

    Bridge.define("Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy.SingleFishboneLayoutAdapter.GroupIterator", {
        m_numberOfSiblings: 0,
        m_numberOfGroups: 0,
        group: 0,
        fromIndex: 0,
        count: 0,
        maxOnLeft: 0,
        ctor: function (numberOfSiblings, numberOfGroups) {
            this.$initialize();
            this.m_numberOfSiblings = numberOfSiblings;
            this.m_numberOfGroups = numberOfGroups;
        },
        countInGroup: function () {
            var countInRow = (this.m_numberOfGroups * 2) | 0;

            var result = 0;
            var countToThisGroup = (((this.group * 2) | 0) + 2) | 0;
            var firstInRow = 0;
            while (true) {
                var countInThisRow = firstInRow >= ((this.m_numberOfSiblings - countInRow) | 0) ? ((this.m_numberOfSiblings - firstInRow) | 0) : countInRow;
                if (countInThisRow >= countToThisGroup) {
                    result = (result + 2) | 0;
                } else {
                    countToThisGroup = (countToThisGroup - 1) | 0;
                    if (countInThisRow >= countToThisGroup) {
                        result = (result + 1) | 0;
                    }
                    break;
                }
                firstInRow = (firstInRow + countInRow) | 0;
            }

            return result;
        },
        nextGroup: function () {
            this.fromIndex = (this.fromIndex + this.count) | 0;

            if (this.fromIndex > 0) {
                this.group = (this.group + 1) | 0;
            }
            this.count = this.countInGroup();
            this.maxOnLeft = (((Bridge.Int.div(this.count, 2)) | 0) + this.count % 2) | 0;
            return this.count !== 0;
        }
    });

    /**
     * Additional information attached to every box in the nodes of visual tree.
     *
     * @public
     * @class Staffer.OrgChart.Layout.NodeLayoutInfo
     */
    Bridge.define("Staffer.OrgChart.Layout.NodeLayoutInfo", {
        /**
         * Number of visible children in this node's immediate children list
         that are affecting each other as siblings during layout.
         Some special auto-generated spacer boxes may not be included into this number,
         those are manually merged into the {@link } after other boxes are ready.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.NodeLayoutInfo
         * @type number
         */
        numberOfSiblings: 0,
        /**
         * Number of sibling rows. Used by strategies that arrange box's immediate children into more than one line.
         Meaning of "row" may differ.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.NodeLayoutInfo
         * @type number
         */
        numberOfSiblingRows: 0,
        /**
         * Number of sibling columns. Used by strategies that arrange box's immediate children into more than one column.
         Meaning of "column" may differ, e.g. it may include one or more boxes per each logical row.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.NodeLayoutInfo
         * @type number
         */
        numberOfSiblingColumns: 0,
        m_effectiveLayoutStrategy: null,
        /**
         * Effective layout strategy, derived from settings or inherited from parent.
         *
         * @instance
         * @function getEffectiveLayoutStrategy
         */
        /**
         * Effective layout strategy, derived from settings or inherited from parent.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.NodeLayoutInfo
         * @memberof Staffer.OrgChart.Layout.NodeLayoutInfo
         * @function setEffectiveLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutStrategyBase}    value
         * @return  {void}
         */
        setEffectiveLayoutStrategy: function (value) {
            this.m_effectiveLayoutStrategy = value;
        },
        /**
         * Returns value of {@link }, throws if <pre><code>null</code></pre>.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.NodeLayoutInfo
         * @memberof Staffer.OrgChart.Layout.NodeLayoutInfo
         * @return  {Staffer.OrgChart.Layout.LayoutStrategyBase}
         */
        requireLayoutStrategy: function () {
            if (this.m_effectiveLayoutStrategy == null) {
                throw new System.Exception("effectiveLayoutStrategy is not set");
            }

            return this.m_effectiveLayoutStrategy;
        }
    });

    /** @namespace Staffer.OrgChart.Misc */

    /**
     * Node wrapper.
     *
     * @public
     * @class Staffer.OrgChart.Misc.Tree$3.TreeNode
     */
    Bridge.define("Staffer.OrgChart.Misc.Tree$3.TreeNode", function (TKey, TValue, TValueState) { return {
        statics: {
            /**
             * Goes through all elements depth-first. Applies <b /> to all children recursively, then to the parent.
             If <b /> returns <pre><code>false</code></pre>, it will stop entire processing.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
             * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
             * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    root    Current node
             * @param   {System.Func}                              func    A func to evaluate on <b>func</b> and its children. Whenever it returns false, iteration stops
             * @return  {boolean}                                          True if <b /> never returned <pre><code>false</code></pre>
             */
            iterateChildFirst: function (root, func) {
                var $t;
                if (root.getChildren() != null) {
                    $t = Bridge.getEnumerator(root.getChildren(), "\"System$Collections$Generic$IEnumerable$1$Staffer$OrgChart$Misc$Tree$3$TreeNode$\" + Bridge.getTypeAlias(TKey) + \"$\" + Bridge.getTypeAlias(TValue) + \"$\" + Bridge.getTypeAlias(TValueState) + \"$getEnumerator\"");
                    while ($t.moveNext()) {
                        var child = $t.getCurrent();
                        if (!Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState).iterateChildFirst(child, func)) {
                            return false;
                        }
                    }
                }

                return func(root);
            },
            /**
             * Goes through all elements depth-first. Applies <b /> to the parent first, then to all children recursively.
             In this mode, children at each level decide for themselves whether they want to iterate further down, e.g. <b /> can cut-off a branch.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
             * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
             * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    root    Current node
             * @param   {System.Func}                              func    A func to evaluate on <b>func</b> and its children. Whenever it returns false, iteration stops
             * @return  {boolean}                                          True if <b /> never returned <pre><code>false</code></pre>
             */
            iterateParentFirst: function (root, func) {
                var $t;
                if (!func(root)) {
                    return false;
                }

                if (root.getChildren() != null) {
                    $t = Bridge.getEnumerator(root.getChildren(), "\"System$Collections$Generic$IEnumerable$1$Staffer$OrgChart$Misc$Tree$3$TreeNode$\" + Bridge.getTypeAlias(TKey) + \"$\" + Bridge.getTypeAlias(TValue) + \"$\" + Bridge.getTypeAlias(TValueState) + \"$getEnumerator\"");
                    while ($t.moveNext()) {
                        var child = $t.getCurrent();
                        // Ignore returned value, in this mode children at each level 
                        // decide for themselves whether they want to iterate further down.
                        Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState).iterateParentFirst(child, func);
                    }
                }

                return true;
            }
        },
        config: {
            properties: {
                /**
                 * Hierarchy level.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @function getLevel
                 * @return  {number}
                 */
                /**
                 * Hierarchy level.
                 *
                 * @instance
                 * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @function setLevel
                 * @param   {number}    value
                 * @return  {void}
                 */
                Level: 0,
                /**
                 * Reference to value element.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @function getElement
                 * @return  {TValue}
                 */
                /**
                 * Reference to value element.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @function setElement
                 * @param   {TValue}    value
                 * @return  {void}
                 */
                Element: Bridge.getDefaultValue(TValue),
                /**
                 * Additional information associated with the {@link } in this node.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @function getState
                 * @return  {TValueState}
                 */
                /**
                 * Additional information associated with the {@link } in this node.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @function setState
                 * @param   {TValueState}    value
                 * @return  {void}
                 */
                State: Bridge.getDefaultValue(TValueState),
                /**
                 * Reference to parent node wrapper.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @function getParentNode
                 * @return  {Staffer.OrgChart.Misc.Tree$3.TreeNode}
                 */
                /**
                 * Reference to parent node wrapper.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @function setParentNode
                 * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    value
                 * @return  {void}
                 */
                ParentNode: null,
                /**
                 * References to child node wrappers.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @function getChildren
                 * @return  {System.Collections.Generic.IList$1}
                 */
                /**
                 * References to child node wrappers.
                 *
                 * @instance
                 * @protected
                 * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
                 * @function setChildren
                 * @param   {System.Collections.Generic.IList$1}    value
                 * @return  {void}
                 */
                Children: null
            }
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @param   {TValue}    element
         * @return  {void}
         */
        ctor: function (element) {
            this.$initialize();
            this.setElement(element);
            this.setState(Bridge.createInstance(TValueState));
        },
        /**
         * Number of children nodes.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @function getChildCount
         * @return  {number}
         */
        /**
         * Number of children nodes.
         *
         * @instance
         * @function setChildCount
         */
        getChildCount: function () {
            return this.getChildren() == null ? 0 : System.Array.getCount(this.getChildren(), Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState));
        },
        /**
         * Adds a new child to the list. Returns reference to self.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    child
         * @return  {Staffer.OrgChart.Misc.Tree$3.TreeNode}
         */
        addChild$1: function (child) {
            return this.insertChild$1(this.getChildCount(), child);
        },
        /**
         * Adds a new child to the list. Returns reference to self.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @param   {TValue}                                   child
         * @return  {Staffer.OrgChart.Misc.Tree$3.TreeNode}
         */
        addChild: function (child) {
            return this.insertChild(this.getChildCount(), child);
        },
        /**
         * Adds a new child to the list. Returns reference to self.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @param   {number}                                   index    
         * @param   {TValue}                                   child
         * @return  {Staffer.OrgChart.Misc.Tree$3.TreeNode}
         */
        insertChild: function (index, child) {
            return this.insertChild$1(index, new (Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState))(child));
        },
        /**
         * Adds a new child to the list. Returns reference to self.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @memberof Staffer.OrgChart.Misc.Tree$3.TreeNode
         * @param   {number}                                   index    
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    child
         * @return  {Staffer.OrgChart.Misc.Tree$3.TreeNode}
         */
        insertChild$1: function (index, child) {
            if (this.getChildren() == null) {
                this.setChildren(new (System.Collections.Generic.List$1(Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState)))());
            }

            System.Array.insert(this.getChildren(), index, child, Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState));
            child.setParentNode(this);
            child.setLevel((this.getLevel() + 1) | 0);

            return this;
        }
    }; });

    /**
     * A point in the diagram logical coordinate space.
     *
     * @public
     * @class Staffer.OrgChart.Layout.Point
     */
    Bridge.define("Staffer.OrgChart.Layout.Point", {
        $kind: "struct",
        statics: {
            getDefaultValue: function () { return new Staffer.OrgChart.Layout.Point(); }
        },
        /**
         * X-coordinate.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Point
         * @type number
         */
        x: 0,
        /**
         * Y-coordinate.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Point
         * @type number
         */
        y: 0,
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Point
         * @memberof Staffer.OrgChart.Layout.Point
         * @param   {number}    x    
         * @param   {number}    y
         * @return  {void}
         */
        $ctor1: function (x, y) {
            this.$initialize();
            this.x = x;
            this.y = y;
        },
        ctor: function () {
            this.$initialize();
        },
        getHashCode: function () {
            var h = Bridge.addHash([1852403652, this.x, this.y]);
            return h;
        },
        equals: function (o) {
            if (!Bridge.is(o, Staffer.OrgChart.Layout.Point)) {
                return false;
            }
            return Bridge.equals(this.x, o.x) && Bridge.equals(this.y, o.y);
        },
        $clone: function (to) { return this; }
    });

    /**
     * A rectangle in the diagram logical coordinate space.
     *
     * @public
     * @class Staffer.OrgChart.Layout.Rect
     */
    Bridge.define("Staffer.OrgChart.Layout.Rect", {
        $kind: "struct",
        statics: {
            /**
             * Computes a rect that encloses both of given rectangles.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Layout.Rect
             * @memberof Staffer.OrgChart.Layout.Rect
             * @param   {Staffer.OrgChart.Layout.Rect}    x    
             * @param   {Staffer.OrgChart.Layout.Rect}    y
             * @return  {Staffer.OrgChart.Layout.Rect}
             */
            op_Addition: function (x, y) {
                var left = Math.min(x.getLeft(), y.getLeft());
                var top = Math.min(x.getTop(), y.getTop());
                var right = Math.max(x.getRight(), y.getRight());
                var bottom = Math.max(x.getBottom(), y.getBottom());
                return new Staffer.OrgChart.Layout.Rect.$ctor3(left, top, right - left, bottom - top);
            },
            getDefaultValue: function () { return new Staffer.OrgChart.Layout.Rect(); }
        },
        config: {
            init: function () {
                this.topLeft = new Staffer.OrgChart.Layout.Point();
                this.size = new Staffer.OrgChart.Layout.Size();
            }
        },
        /**
         * Ctr. to help client code prevent naming conflicts with Rect, Point and Size type names.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Rect
         * @memberof Staffer.OrgChart.Layout.Rect
         * @param   {number}    x    
         * @param   {number}    y    
         * @param   {number}    w    
         * @param   {number}    h
         * @return  {void}
         */
        $ctor3: function (x, y, w, h) {
            this.$initialize();
            if (w < 0) {
                throw new System.ArgumentOutOfRangeException("w");
            }

            if (h < 0) {
                throw new System.ArgumentOutOfRangeException("h");
            }

            this.topLeft = new Staffer.OrgChart.Layout.Point.$ctor1(x, y);
            this.size = new Staffer.OrgChart.Layout.Size.$ctor1(w, h);
        },
        /**
         * Ctr. for case with known location.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Rect
         * @memberof Staffer.OrgChart.Layout.Rect
         * @param   {Staffer.OrgChart.Layout.Point}    topLeft    
         * @param   {Staffer.OrgChart.Layout.Size}     size
         * @return  {void}
         */
        $ctor1: function (topLeft, size) {
            this.$initialize();
            this.topLeft = topLeft;
            this.size = size;
        },
        /**
         * Ctr. for case with only the size known.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Rect
         * @memberof Staffer.OrgChart.Layout.Rect
         * @param   {Staffer.OrgChart.Layout.Size}    size
         * @return  {void}
         */
        $ctor2: function (size) {
            this.$initialize();
            this.topLeft = new Staffer.OrgChart.Layout.Point.$ctor1(0, 0);
            this.size = size;
        },
        ctor: function () {
            this.$initialize();
        },
        /**
         * Computed bottom-right corner.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Rect
         * @memberof Staffer.OrgChart.Layout.Rect
         * @function getBottomRight
         * @return  {Staffer.OrgChart.Layout.Point}
         */
        /**
         * Computed bottom-right corner.
         *
         * @instance
         * @function setBottomRight
         */
        getBottomRight: function () {
            return new Staffer.OrgChart.Layout.Point.$ctor1(this.topLeft.x + this.size.width, this.topLeft.y + this.size.height);
        },
        /**
         * Left edge.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Rect
         * @memberof Staffer.OrgChart.Layout.Rect
         * @function getLeft
         * @return  {number}
         */
        /**
         * Left edge.
         *
         * @instance
         * @function setLeft
         */
        getLeft: function () {
            return this.topLeft.x;
        },
        /**
         * Right edge.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Rect
         * @memberof Staffer.OrgChart.Layout.Rect
         * @function getRight
         * @return  {number}
         */
        /**
         * Right edge.
         *
         * @instance
         * @function setRight
         */
        getRight: function () {
            return this.topLeft.x + this.size.width;
        },
        /**
         * Horizontal center.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Rect
         * @memberof Staffer.OrgChart.Layout.Rect
         * @function getCenterH
         * @return  {number}
         */
        /**
         * Horizontal center.
         *
         * @instance
         * @function setCenterH
         */
        getCenterH: function () {
            return this.topLeft.x + this.size.width / 2;
        },
        /**
         * Vertical center.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Rect
         * @memberof Staffer.OrgChart.Layout.Rect
         * @function getCenterV
         * @return  {number}
         */
        /**
         * Vertical center.
         *
         * @instance
         * @function setCenterV
         */
        getCenterV: function () {
            return this.topLeft.y + this.size.height / 2;
        },
        /**
         * Top edge.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Rect
         * @memberof Staffer.OrgChart.Layout.Rect
         * @function getTop
         * @return  {number}
         */
        /**
         * Top edge.
         *
         * @instance
         * @function setTop
         */
        getTop: function () {
            return this.topLeft.y;
        },
        /**
         * Bottom edge.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Rect
         * @memberof Staffer.OrgChart.Layout.Rect
         * @function getBottom
         * @return  {number}
         */
        /**
         * Bottom edge.
         *
         * @instance
         * @function setBottom
         */
        getBottom: function () {
            return this.topLeft.y + this.size.height;
        },
        /**
         * Returns a rectangle moved by <b /> horizontally.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Rect
         * @memberof Staffer.OrgChart.Layout.Rect
         * @param   {number}                          offsetX
         * @return  {Staffer.OrgChart.Layout.Rect}
         */
        moveH: function (offsetX) {
            return new Staffer.OrgChart.Layout.Rect.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(this.getLeft() + offsetX, this.getTop()), this.size);
        },
        getHashCode: function () {
            var h = Bridge.addHash([1952671058, this.topLeft, this.size]);
            return h;
        },
        equals: function (o) {
            if (!Bridge.is(o, Staffer.OrgChart.Layout.Rect)) {
                return false;
            }
            return Bridge.equals(this.topLeft, o.topLeft) && Bridge.equals(this.size, o.size);
        },
        $clone: function (to) { return this; }
    });

    /**
     * A point in the diagram logical coordinate space.
     *
     * @public
     * @class Staffer.OrgChart.Layout.Size
     */
    Bridge.define("Staffer.OrgChart.Layout.Size", {
        $kind: "struct",
        statics: {
            getDefaultValue: function () { return new Staffer.OrgChart.Layout.Size(); }
        },
        /**
         * X-coordinate.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Size
         * @type number
         */
        width: 0,
        /**
         * Y-coordinate.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Layout.Size
         * @type number
         */
        height: 0,
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Layout.Size
         * @memberof Staffer.OrgChart.Layout.Size
         * @param   {number}    w    
         * @param   {number}    h
         * @return  {void}
         */
        $ctor1: function (w, h) {
            this.$initialize();
            this.width = w;
            this.height = h;
        },
        ctor: function () {
            this.$initialize();
        },
        getHashCode: function () {
            var h = Bridge.addHash([1702521171, this.width, this.height]);
            return h;
        },
        equals: function (o) {
            if (!Bridge.is(o, Staffer.OrgChart.Layout.Size)) {
                return false;
            }
            return Bridge.equals(this.width, o.width) && Bridge.equals(this.height, o.height);
        },
        $clone: function (to) { return this; }
    });

    /**
     * General-purpose tree builder.
     *
     * @public
     * @class Staffer.OrgChart.Misc.Tree$3
     * @param   {Function}    [name]    Type of the element identifier
     * @param   {Function}    [name]    Type of the element
     * @param   {Function}    [name]    Type of the additional state object bound to the element
     */
    Bridge.define("Staffer.OrgChart.Misc.Tree$3", function (TKey, TValue, TValueState) { return {
        statics: {
            /**
             * Constructs a new tree.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Misc.Tree$3
             * @memberof Staffer.OrgChart.Misc.Tree$3
             * @param   {System.Collections.Generic.IEnumerable$1}    source              Source collection of elements, will be iterated only once
             * @param   {System.Func}                                 getKeyFunc          Func to extract key of the element. Key must not be null and must be unique across all elements of <b>getKeyFunc</b>
             * @param   {System.Func}                                 getParentKeyFunc    Func to extract parent key of the element
             * @return  {Staffer.OrgChart.Misc.Tree$3}
             */
            build: function (source, getKeyFunc, getParentKeyFunc) {
                var $t, $t1;
                var result = new (Staffer.OrgChart.Misc.Tree$3(TKey,TValue,TValueState))(getParentKeyFunc, getKeyFunc);

                // build dictionary of nodes
                $t = Bridge.getEnumerator(source, null, TValue);
                while ($t.moveNext()) {
                    var item = $t.getCurrent();
                    var key = getKeyFunc(item);

                    if (Bridge.referenceEquals(null, key)) {
                        throw new System.Exception("Null key for an element");
                    }

                    if (result.getNodes().containsKey(key)) {
                        throw new System.Exception(System.String.concat("Duplicate key: ", key));
                    }

                    var node = new (Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState))(item);
                    result.getNodes().add(getKeyFunc(item), node);
                }

                // build the tree
                $t1 = Bridge.getEnumerator(result.getNodes().getValues(), "\"System$Collections$Generic$IEnumerable$1$Staffer$OrgChart$Misc$Tree$3$TreeNode$\" + Bridge.getTypeAlias(TKey) + \"$\" + Bridge.getTypeAlias(TValue) + \"$\" + Bridge.getTypeAlias(TValueState) + \"$getEnumerator\"");
                while ($t1.moveNext()) {
                    var node1 = $t1.getCurrent();
                    var parentKey = getParentKeyFunc(node1.getElement());

                    var parentNode = { };
                    if (result.getNodes().tryGetValue(parentKey, parentNode)) {
                        parentNode.v.addChild$1(node1);
                    } else {
                        // In case of data errors, parent key may be not null, but parent node is not there.
                        // Just add the node to roots.
                        result.getRoots().add(node1);
                    }
                }

                return result;
            }
        },
        config: {
            properties: {
                /**
                 * Root node wrappers.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Misc.Tree$3
                 * @memberof Staffer.OrgChart.Misc.Tree$3
                 * @function getRoots
                 * @return  {System.Collections.Generic.List$1}
                 */
                /**
                 * Root node wrappers.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Misc.Tree$3
                 * @memberof Staffer.OrgChart.Misc.Tree$3
                 * @function setRoots
                 * @param   {System.Collections.Generic.List$1}    value
                 * @return  {void}
                 */
                Roots: null,
                /**
                 * Dictionary of all node wrappers.
                 Nodes are always one-to-one with elements, so they are identified by element keys.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Misc.Tree$3
                 * @memberof Staffer.OrgChart.Misc.Tree$3
                 * @function getNodes
                 * @return  {System.Collections.Generic.Dictionary$2}
                 */
                /**
                 * Dictionary of all node wrappers.
                 Nodes are always one-to-one with elements, so they are identified by element keys.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Misc.Tree$3
                 * @memberof Staffer.OrgChart.Misc.Tree$3
                 * @function setNodes
                 * @param   {System.Collections.Generic.Dictionary$2}    value
                 * @return  {void}
                 */
                Nodes: null,
                /**
                 * Func to extract element key from element.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Misc.Tree$3
                 * @memberof Staffer.OrgChart.Misc.Tree$3
                 * @function getGetKeyFunc
                 * @return  {System.Func}
                 */
                /**
                 * Func to extract element key from element.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Misc.Tree$3
                 * @memberof Staffer.OrgChart.Misc.Tree$3
                 * @function setGetKeyFunc
                 * @param   {System.Func}    value
                 * @return  {void}
                 */
                GetKeyFunc: null,
                /**
                 * Func to extract parent key from element.
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Misc.Tree$3
                 * @memberof Staffer.OrgChart.Misc.Tree$3
                 * @function getGetParentKeyFunc
                 * @return  {System.Func}
                 */
                /**
                 * Func to extract parent key from element.
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Misc.Tree$3
                 * @memberof Staffer.OrgChart.Misc.Tree$3
                 * @function setGetParentKeyFunc
                 * @param   {System.Func}    value
                 * @return  {void}
                 */
                GetParentKeyFunc: null,
                /**
                 * Max value of {@link } plus one (because root nodes are level zero).
                 *
                 * @instance
                 * @public
                 * @this Staffer.OrgChart.Misc.Tree$3
                 * @memberof Staffer.OrgChart.Misc.Tree$3
                 * @function getDepth
                 * @return  {number}
                 */
                /**
                 * Max value of {@link } plus one (because root nodes are level zero).
                 *
                 * @instance
                 * @private
                 * @this Staffer.OrgChart.Misc.Tree$3
                 * @memberof Staffer.OrgChart.Misc.Tree$3
                 * @function setDepth
                 * @param   {number}    value
                 * @return  {void}
                 */
                Depth: 0
            }
        },
        /**
         * Ctr.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Misc.Tree$3
         * @memberof Staffer.OrgChart.Misc.Tree$3
         * @param   {System.Func}    getParentKeyFunc    
         * @param   {System.Func}    getKeyFunc
         * @return  {void}
         */
        ctor: function (getParentKeyFunc, getKeyFunc) {
            this.$initialize();
            this.setGetParentKeyFunc(getParentKeyFunc);
            this.setGetKeyFunc(getKeyFunc);
            this.setRoots(new (System.Collections.Generic.List$1(Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState)))());
            this.setNodes(new (System.Collections.Generic.Dictionary$2(TKey,Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState)))());
        },
        /**
         * Goes through all elements depth-first. Applies <b /> to all children recursively, then to the parent.
         If <b /> returns <pre><code>false</code></pre>, it will stop entire processing.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Misc.Tree$3
         * @memberof Staffer.OrgChart.Misc.Tree$3
         * @param   {System.Func}    func    A func to evaluate on items of {@link } and their children. Whenever it returns false, iteration stops
         * @return  {boolean}                True if <b /> never returned <pre><code>false</code></pre>
         */
        iterateChildFirst: function (func) {
            var $t;
            $t = Bridge.getEnumerator(this.getRoots());
            while ($t.moveNext()) {
                var root = $t.getCurrent();
                if (!Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState).iterateChildFirst(root, func)) {
                    return false;
                }
            }

            return true;
        },
        /**
         * Goes through all elements depth-first. Applies <b /> to the parent first, then to all children recursively.
         In this mode children at each level decide for themselves whether they want to iterate further down, e.g. <b /> can cut-off a branch.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Misc.Tree$3
         * @memberof Staffer.OrgChart.Misc.Tree$3
         * @param   {System.Func}    func    A func to evaluate on items of {@link } and their children. Whenever it returns false, iteration stops
         * @return  {boolean}                True if <b /> never returned <pre><code>false</code></pre>
         */
        iterateParentFirst: function (func) {
            var $t;
            $t = Bridge.getEnumerator(this.getRoots());
            while ($t.moveNext()) {
                var root = $t.getCurrent();
                // Ignore returned value, in this mode children at each level 
                // decide for themselves whether they want to iterate further down.
                Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState).iterateParentFirst(root, func);
            }

            return true;
        },
        /**
         * Update every node's {@link } and {@link } of the tree.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Misc.Tree$3
         * @memberof Staffer.OrgChart.Misc.Tree$3
         * @return  {void}
         */
        updateHierarchyStats: function () {
            // initialize hierarchy level numbers
            this.setDepth(0);
            this.iterateParentFirst(Bridge.fn.bind(this, $_.Staffer.OrgChart.Misc.Tree$3.f1));
        }
    }; });

    Bridge.ns("Staffer.OrgChart.Misc.Tree$3", $_);

    Bridge.apply($_.Staffer.OrgChart.Misc.Tree$3, {
        f1: function (x) {
            if (x.getParentNode() != null) {
                x.setLevel((x.getParentNode().getLevel() + 1) | 0);
                this.setDepth(Math.max(((1 + x.getLevel()) | 0), this.getDepth()));
            } else {
                x.setLevel(0);
                this.setDepth(1);
            }
            return true;
        }
    });

    /** @namespace Staffer.OrgChart.Test */

    /**
     * Test data generator utility.
     *
     * @public
     * @class Staffer.OrgChart.Test.TestDataGen
     */
    Bridge.define("Staffer.OrgChart.Test.TestDataGen", {
        statics: {
            /**
             * Some random box sizes.
             *
             * @static
             * @public
             * @this Staffer.OrgChart.Test.TestDataGen
             * @memberof Staffer.OrgChart.Test.TestDataGen
             * @param   {Staffer.OrgChart.Layout.BoxContainer}    boxContainer
             * @return  {void}
             */
            generateBoxSizes: function (boxContainer) {
                var $t;
                var minWidth = 50;
                var minHeight = 50;
                var widthVariation = 50;
                var heightVariation = 50;

                var random = new System.Random.$ctor1(0);
                $t = Bridge.getEnumerator(boxContainer.getBoxesById().System$Collections$Generic$IDictionary$2$System$Int32$Staffer$OrgChart$Layout$Box$getValues(), "System$Collections$Generic$IEnumerable$1$Staffer$OrgChart$Layout$Box$getEnumerator");
                while ($t.moveNext()) {
                    var box = $t.getCurrent();
                    box.frame.exterior = box.isSpecial ? new Staffer.OrgChart.Layout.Rect.$ctor2(new Staffer.OrgChart.Layout.Size.$ctor1(minWidth, minHeight)) : new Staffer.OrgChart.Layout.Rect.$ctor2(new Staffer.OrgChart.Layout.Size.$ctor1(((minWidth + random.next$1(widthVariation)) | 0), ((minHeight + random.next$1(heightVariation)) | 0)));
                }
            }
        },
        /**
         * Adds some data items into supplied <b />.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Test.TestDataGen
         * @memberof Staffer.OrgChart.Test.TestDataGen
         * @param   {Staffer.OrgChart.Test.TestDataSource}    dataSource    
         * @param   {number}                                  count
         * @return  {void}
         */
        generateDataItems: function (dataSource, count) {
            var $t;
            $t = Bridge.getEnumerator(this.generateRandomDataItems(count), null, Staffer.OrgChart.Test.TestDataItem);
            while ($t.moveNext()) {
                var item = $t.getCurrent();
                dataSource.items.add(item.id, item);
            }
        },
        generateRandomDataItems: function (itemCount) {
            var $t;
            var $yield = [];
            if (itemCount < 0) {
                throw new System.ArgumentOutOfRangeException("itemCount", "Count must be zero or positive", null, itemCount);
            }

            var random = new System.Random.$ctor1(0);

            var items = new (System.Collections.Generic.List$1(Staffer.OrgChart.Test.TestDataItem))(itemCount);
            for (var i = 0; i < itemCount; i = (i + 1) | 0) {
                items.add(Bridge.merge(new Staffer.OrgChart.Test.TestDataItem(), {
                    id: i.toString()
                } ));
            }

            var firstInLayer = 1;
            var prevLayerSize = 1;
            while (firstInLayer < itemCount) {
                var layerSize = (((20 + prevLayerSize) | 0) + random.next$1(((prevLayerSize * 2) | 0))) | 0;
                for (var i1 = firstInLayer; i1 < ((firstInLayer + layerSize) | 0) && i1 < itemCount; i1 = (i1 + 1) | 0) {
                    var parentIndex = (((firstInLayer - 1) | 0) - random.next$1(prevLayerSize)) | 0;
                    items.getItem(i1).parentId = items.getItem(parentIndex).id;
                }

                firstInLayer = (firstInLayer + layerSize) | 0;
                prevLayerSize = layerSize;
            }

            // now shuffle the items a bit, to prevent clients from assuming that data always comes in hierarchical order
            //for (var i = 0; i < items.Count/2; i++)
            //{
            //    var from = random.Next(items.Count);
            //    var to = random.Next(items.Count);
            //    var temp = items[from];
            //    items[from] = items[to];
            //    items[to] = temp;
            //}

            $t = Bridge.getEnumerator(items);
            while ($t.moveNext()) {
                var item = $t.getCurrent();
                $yield.push(item);
            }
            return System.Array.toEnumerable($yield);
        }
    });

    /**
     * A data item wrapper.
     *
     * @public
     * @class Staffer.OrgChart.Test.TestDataItem
     */
    Bridge.define("Staffer.OrgChart.Test.TestDataItem", {
        /**
         * Data item id.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Test.TestDataItem
         * @type string
         */
        id: null,
        /**
         * Optional identifier of the parent data item.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Test.TestDataItem
         * @type string
         */
        parentId: null,
        /**
         * Some string field.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Test.TestDataItem
         * @type string
         */
        string1: null,
        /**
         * Some string field.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Test.TestDataItem
         * @type string
         */
        string2: null,
        config: {
            init: function () {
                this.date1 = new Date(-864e13);
            }
        }
    });

    Bridge.define("System.DebuggerDisplayAttribute", {
        inherits: [System.Attribute],
        ctor: function (template) {
            this.$initialize();
            System.Attribute.ctor.call(this);
        }
    });

    /**
     * Arranges child boxes in a single line under the parent.
     Can be configured to position parent in the middle, on the left or right from children.
     *
     * @public
     * @class Staffer.OrgChart.Layout.LinearLayoutStrategy
     * @augments Staffer.OrgChart.Layout.LayoutStrategyBase
     */
    Bridge.define("Staffer.OrgChart.Layout.LinearLayoutStrategy", {
        inherits: [Staffer.OrgChart.Layout.LayoutStrategyBase],
        /**
         * A chance for layout strategy to append special auto-generated boxes into the visual tree.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.LinearLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.LinearLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}      state    
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    node
         * @return  {void}
         */
        preProcessThisNode: function (state, node) {
            if (this.parentAlignment !== Staffer.OrgChart.Layout.BranchParentAlignment.Center) {
                throw new System.InvalidOperationException("Unsupported value for ParentAlignment");
            }

            var normalChildCount = node.getChildCount();
            if (normalChildCount > 0) {
                node.getState().numberOfSiblings = node.getElement().isCollapsed ? 0 : normalChildCount;

                // only add spacers for non-collapsed boxes
                if (!node.getElement().isCollapsed) {
                    var verticalSpacer = Staffer.OrgChart.Layout.Box.special(Staffer.OrgChart.Layout.Box.None, node.getElement().id, false);
                    node.addChild(verticalSpacer);

                    var horizontalSpacer = Staffer.OrgChart.Layout.Box.special(Staffer.OrgChart.Layout.Box.None, node.getElement().id, false);
                    node.addChild(horizontalSpacer);
                }
            }
        },
        /**
         * Applies layout changes to a given box and its children.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.LinearLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.LinearLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}                state    
         * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    level
         * @return  {void}
         */
        applyVerticalLayout: function (state, level) {
            var node = level.branchRoot;

            if (node.getLevel() === 0) {
                node.getElement().frame.siblingsRowV = new Staffer.OrgChart.Layout.Dimensions.$ctor1(node.getElement().frame.exterior.getTop(), node.getElement().frame.exterior.getBottom());
            }

            var siblingsRowExterior = Staffer.OrgChart.Layout.Dimensions.minMax();
            if (node.getState().numberOfSiblings === 0) {
                return;
            }

            for (var i = 0; i < node.getState().numberOfSiblings; i = (i + 1) | 0) {
                var child = System.Array.getItem(node.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                var rect = child.getElement().frame.exterior;

                var top = node.getElement().frame.siblingsRowV.to + this.parentChildSpacing;
                child.getElement().frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(rect.getLeft(), top, rect.size.width, rect.size.height);
                child.getElement().frame.branchExterior = child.getElement().frame.exterior;

                siblingsRowExterior = Staffer.OrgChart.Layout.Dimensions.op_Addition(siblingsRowExterior, new Staffer.OrgChart.Layout.Dimensions.$ctor1(top, top + rect.size.height));
            }

            siblingsRowExterior = new Staffer.OrgChart.Layout.Dimensions.$ctor1(siblingsRowExterior.from, siblingsRowExterior.to);

            for (var i1 = 0; i1 < node.getState().numberOfSiblings; i1 = (i1 + 1) | 0) {
                var child1 = System.Array.getItem(node.getChildren(), i1, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                child1.getElement().frame.siblingsRowV = siblingsRowExterior;

                // re-enter layout algorithm for child branch
                Staffer.OrgChart.Layout.LayoutAlgorithm.verticalLayout(state, child1);
            }
        },
        /**
         * Applies layout changes to a given box and its children.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.LinearLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.LinearLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}                state    
         * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    level
         * @return  {void}
         */
        applyHorizontalLayout: function (state, level) {
            var node = level.branchRoot;

            for (var i = 0; i < node.getState().numberOfSiblings; i = (i + 1) | 0) {
                var child = System.Array.getItem(node.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                // re-enter layout algorithm for child branch
                Staffer.OrgChart.Layout.LayoutAlgorithm.horizontalLayout(state, child);
            }

            if (this.parentAlignment === Staffer.OrgChart.Layout.BranchParentAlignment.Center) {
                if (node.getLevel() > 0) {
                    var rect = node.getElement().frame.exterior;
                    var leftmost = System.Array.getItem(node.getChildren(), 0, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getCenterH();
                    var rightmost = System.Array.getItem(node.getChildren(), ((node.getState().numberOfSiblings - 1) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getCenterH();
                    var desiredCenter = leftmost + (rightmost - leftmost) / 2;
                    var center = rect.getCenterH();
                    var diff = center - desiredCenter;
                    Staffer.OrgChart.Layout.LayoutAlgorithm.moveChildrenOnly(state, level, diff);

                    // vertical connector from parent 
                    var verticalSpacerBox = System.Array.getItem(node.getChildren(), node.getState().numberOfSiblings, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement();
                    verticalSpacerBox.frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(center - this.parentConnectorShield / 2, rect.getBottom(), this.parentConnectorShield, System.Array.getItem(node.getChildren(), 0, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.siblingsRowV.from - rect.getBottom());
                    verticalSpacerBox.frame.branchExterior = verticalSpacerBox.frame.exterior;

                    state.mergeSpacer(verticalSpacerBox);

                    // horizontal protector
                    var firstInRow = System.Array.getItem(node.getChildren(), 0, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame;

                    var horizontalSpacerBox = System.Array.getItem(node.getChildren(), ((node.getState().numberOfSiblings + 1) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement();
                    horizontalSpacerBox.frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(firstInRow.exterior.getLeft(), firstInRow.siblingsRowV.from - this.parentChildSpacing, System.Array.getItem(node.getChildren(), ((node.getState().numberOfSiblings - 1) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getRight() - firstInRow.exterior.getLeft(), this.parentChildSpacing);
                    horizontalSpacerBox.frame.branchExterior = horizontalSpacerBox.frame.exterior;

                    state.mergeSpacer(horizontalSpacerBox);
                }
            } else {
                throw new System.InvalidOperationException("Invalid ParentAlignment setting");
            }
        },
        /**
         * Allocates and routes connectors.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.LinearLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.LinearLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}      state    
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    node
         * @return  {void}
         */
        routeConnectors: function (state, node) {
            var normalChildCount = node.getState().numberOfSiblings;

            var count = normalChildCount === 0 ? 0 : normalChildCount === 1 ? 1 : ((2 + normalChildCount) | 0); // one upward edge for each child

            if (count === 0) {
                node.getElement().frame.connector = null;
                return;
            }

            var segments = System.Array.init(count, function (){
                return new Staffer.OrgChart.Layout.Edge();
            });

            var rootRect = node.getElement().frame.exterior;
            var center = rootRect.getCenterH();

            if (node.getChildren() == null) {
                throw new System.Exception("State is present, but children not set");
            }

            if (count === 1) {
                segments[0] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(center, rootRect.getBottom()), new Staffer.OrgChart.Layout.Point.$ctor1(center, System.Array.getItem(node.getChildren(), 0, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getTop()));
            } else {
                var space = System.Array.getItem(node.getChildren(), 0, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.siblingsRowV.from - rootRect.getBottom();

                segments[0] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(center, rootRect.getBottom()), new Staffer.OrgChart.Layout.Point.$ctor1(center, rootRect.getBottom() + space - this.childConnectorHookLength));

                for (var i = 0; i < normalChildCount; i = (i + 1) | 0) {
                    var childRect = System.Array.getItem(node.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior;
                    var childCenter = childRect.getCenterH();
                    segments[((1 + i) | 0)] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(childCenter, childRect.getTop()), new Staffer.OrgChart.Layout.Point.$ctor1(childCenter, childRect.getTop() - this.childConnectorHookLength));
                }

                segments[((count - 1) | 0)] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(segments[1].to.x, segments[1].to.y), new Staffer.OrgChart.Layout.Point.$ctor1(segments[((count - 2) | 0)].to.x, segments[1].to.y));
            }

            node.getElement().frame.connector = new Staffer.OrgChart.Layout.Connector(segments);
        }
    });

    /**
     * Implements layout for a single vertically stretched fishbone.
     Re-used by {@link } to layout multiple groups of siblings.
     *
     * @private
     * @class Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy.SingleFishboneLayoutAdapter
     * @augments Staffer.OrgChart.Layout.LayoutStrategyBase
     */
    Bridge.define("Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy.SingleFishboneLayoutAdapter", {
        inherits: [Staffer.OrgChart.Layout.LayoutStrategyBase],
        realRoot: null,
        specialRoot: null,
        iterator: null,
        ctor: function (realRoot) {
            this.$initialize();
            Staffer.OrgChart.Layout.LayoutStrategyBase.ctor.call(this);
            this.iterator = new Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy.SingleFishboneLayoutAdapter.GroupIterator(realRoot.getState().numberOfSiblings, realRoot.getState().numberOfSiblingColumns);

            this.realRoot = realRoot;
            this.specialRoot = Bridge.merge(new Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy.SingleFishboneLayoutAdapter.TreeNodeView(Staffer.OrgChart.Layout.Box.special(Staffer.OrgChart.Layout.Box.None, realRoot.getElement().id, true)), {
                setLevel: this.realRoot.getLevel(),
                setParentNode: this.realRoot
            } );

            this.specialRoot.getState().setEffectiveLayoutStrategy(this);

            var parentStrategy = Bridge.cast(realRoot.getState().requireLayoutStrategy(), Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy);
            this.siblingSpacing = parentStrategy.siblingSpacing;
            this.parentConnectorShield = parentStrategy.parentConnectorShield;
            this.parentChildSpacing = parentStrategy.parentChildSpacing;
            this.parentAlignment = parentStrategy.parentAlignment;
            this.childConnectorHookLength = parentStrategy.childConnectorHookLength;
        },
        nextGroup: function () {
            if (!this.iterator.nextGroup()) {
                return false;
            }

            this.specialRoot.getState().numberOfSiblings = this.iterator.count;
            this.specialRoot.prepare(((this.realRoot.getState().numberOfSiblingRows * 2) | 0));

            for (var i = 0; i < this.iterator.count; i = (i + 1) | 0) {
                this.specialRoot.addChildView(System.Array.getItem(this.realRoot.getChildren(), ((this.iterator.fromIndex + i) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)));
            }
            var spacer = System.Array.getItem(this.realRoot.getChildren(), ((((this.realRoot.getState().numberOfSiblings + 1) | 0) + this.iterator.group) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
            this.specialRoot.addChildView(spacer);

            this.specialRoot.getElement().frame.exterior = this.realRoot.getElement().frame.exterior;
            this.specialRoot.getElement().frame.branchExterior = this.realRoot.getElement().frame.exterior;
            this.specialRoot.getElement().frame.siblingsRowV = this.realRoot.getElement().frame.siblingsRowV;

            return true;
        },
        preProcessThisNode: function (state, node) {
            throw new System.NotSupportedException();
        },
        applyVerticalLayout: function (state, level) {
            var prevRowBottom = this.specialRoot.getElement().frame.siblingsRowV.to;

            for (var i = 0; i < this.iterator.maxOnLeft; i = (i + 1) | 0) {
                var child = System.Array.getItem(this.specialRoot.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                var frame = child.getElement().frame;
                var rect = frame.exterior;
                frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(rect.getLeft(), prevRowBottom + this.parentChildSpacing, rect.size.width, rect.size.height);

                var rowExterior = new Staffer.OrgChart.Layout.Dimensions.$ctor1(frame.exterior.getTop(), frame.exterior.getBottom());

                var i2 = (i + this.iterator.maxOnLeft) | 0;
                if (i2 < this.iterator.count) {
                    var child2 = System.Array.getItem(this.specialRoot.getChildren(), i2, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                    var frame2 = child2.getElement().frame;
                    var rect2 = child2.getElement().frame.exterior;
                    frame2.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(rect2.getLeft(), prevRowBottom + this.parentChildSpacing, rect2.size.width, rect2.size.height);

                    if (frame2.exterior.getBottom() > frame.exterior.getBottom()) {
                        frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(rect.getLeft(), frame2.exterior.getCenterV() - rect.size.height / 2, rect.size.width, rect.size.height);
                    } else if (frame2.exterior.getBottom() < frame.exterior.getBottom()) {
                        frame2.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(rect2.getLeft(), frame.exterior.getCenterV() - rect2.size.height / 2, rect2.size.width, rect2.size.height);
                    }

                    frame2.branchExterior = frame2.exterior;
                    rowExterior = Staffer.OrgChart.Layout.Dimensions.op_Addition(rowExterior, new Staffer.OrgChart.Layout.Dimensions.$ctor1(frame2.exterior.getTop(), frame2.exterior.getBottom()));

                    frame2.siblingsRowV = rowExterior;
                    Staffer.OrgChart.Layout.LayoutAlgorithm.verticalLayout(state, child2);
                    prevRowBottom = frame2.branchExterior.getBottom();
                }

                frame.branchExterior = frame.exterior;
                frame.siblingsRowV = rowExterior;
                Staffer.OrgChart.Layout.LayoutAlgorithm.verticalLayout(state, child);
                prevRowBottom = Math.max(prevRowBottom, frame.branchExterior.getBottom());
            }
        },
        applyHorizontalLayout: function (state, level) {
            if (!Bridge.referenceEquals(level.branchRoot, this.specialRoot)) {
                throw new System.InvalidOperationException("Wrong root node received");
            }

            var left = true;
            var countOnThisSide = 0;
            for (var i = 0; i < this.iterator.count; i = (i + 1) | 0) {
                var child = System.Array.getItem(this.specialRoot.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                Staffer.OrgChart.Layout.LayoutAlgorithm.horizontalLayout(state, child);

                // we go top-bottom to layout left side of the group,
                // then add a carrier protector
                // then top-bottom to fill right side of the group
                if (((countOnThisSide = (countOnThisSide + 1) | 0)) === this.iterator.maxOnLeft) {
                    if (left) {
                        // horizontally align children in left pillar
                        Staffer.OrgChart.Layout.LayoutAlgorithm.alignHorizontalCenters(state, level, this.enumerateSiblings(0, this.iterator.maxOnLeft));

                        left = false;
                        countOnThisSide = 0;

                        var rightmost = System.Double.min;
                        for (var k = 0; k < i; k = (k + 1) | 0) {
                            rightmost = Math.max(rightmost, System.Array.getItem(this.specialRoot.getChildren(), k, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.branchExterior.getRight());
                        }

                        // vertical spacer does not have to be extended to the bottom of the lowest branch,
                        // unless the lowest branch on the right side has some children and is expanded
                        if (this.iterator.count % 2 !== 0) {
                            rightmost = Math.max(rightmost, child.getElement().frame.exterior.getRight());
                        } else {
                            var opposite = System.Array.getItem(this.specialRoot.getChildren(), ((this.specialRoot.getState().numberOfSiblings - 1) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                            if (opposite.getElement().isCollapsed || opposite.getChildCount() === 0) {
                                rightmost = Math.max(rightmost, child.getElement().frame.exterior.getRight());
                            } else {
                                rightmost = Math.max(rightmost, child.getElement().frame.branchExterior.getRight());
                            }
                        }

                        // integrate protector for group's vertical carrier 
                        var spacer = System.Array.getItem(this.specialRoot.getChildren(), this.specialRoot.getState().numberOfSiblings, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement();
                        spacer.frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(rightmost, System.Array.getItem(this.specialRoot.getChildren(), 0, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.siblingsRowV.from, this.siblingSpacing, child.getElement().frame.siblingsRowV.to - System.Array.getItem(this.specialRoot.getChildren(), 0, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.siblingsRowV.from);
                        spacer.frame.branchExterior = spacer.frame.exterior;
                        level.boundary.mergeFrom$1(spacer);
                    } else {
                        // horizontally align children in right pillar
                        Staffer.OrgChart.Layout.LayoutAlgorithm.alignHorizontalCenters(state, level, this.enumerateSiblings(this.iterator.maxOnLeft, this.iterator.count));
                    }
                }
            }
        },
        enumerateSiblings: function (from, to) {
            var $yield = [];
            for (var i = from; i < to; i = (i + 1) | 0) {
                $yield.push(System.Array.getItem(this.specialRoot.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)));
            }
            return System.Array.toEnumerable($yield);
        },
        routeConnectors: function (state, node) {
            throw new System.NotSupportedException();
        }
    });

    Bridge.define("Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy.SingleFishboneLayoutAdapter.TreeNodeView", {
        inherits: [Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)],
        ctor: function (element) {
            this.$initialize();
            Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo).ctor.call(this, element);
        },
        prepare: function (capacity) {
            if (this.getChildren() == null) {
                this.setChildren(new (System.Collections.Generic.List$1(Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)))(capacity));
            } else {
                System.Array.clear(this.getChildren(), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
            }
        },
        addChildView: function (node) {
            System.Array.add(this.getChildren(), node, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
        }
    });

    /**
     * Arranges child boxes in a single vertical column under the parent, 
     somewhat offset to the left or to the right, depending on {@link }.
     Cannot be configured to position parent in the middle of children.
     Children are attached to a central vertical carrier going from parent's bottom.
     *
     * @public
     * @class Staffer.OrgChart.Layout.SingleColumnLayoutStrategy
     * @augments Staffer.OrgChart.Layout.LayoutStrategyBase
     */
    Bridge.define("Staffer.OrgChart.Layout.SingleColumnLayoutStrategy", {
        inherits: [Staffer.OrgChart.Layout.LayoutStrategyBase],
        /**
         * A chance for layout strategy to append special auto-generated boxes into the visual tree.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.SingleColumnLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.SingleColumnLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}      state    
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    node
         * @return  {void}
         */
        preProcessThisNode: function (state, node) {
            if (this.parentAlignment !== Staffer.OrgChart.Layout.BranchParentAlignment.Left && this.parentAlignment !== Staffer.OrgChart.Layout.BranchParentAlignment.Right) {
                throw new System.InvalidOperationException("Unsupported value for ParentAlignment");
            }

            node.getState().numberOfSiblings = node.getElement().isCollapsed ? 0 : node.getChildCount();

            // only add spacers for non-collapsed boxes
            if (node.getState().numberOfSiblings > 0 && node.getLevel() > 0) {
                // add one (for vertical spacer) into the count of layout columns
                node.getState().numberOfSiblingColumns = 1;
                node.getState().numberOfSiblingRows = node.getChildCount();

                // add parent's vertical carrier to the end
                var verticalSpacer = Staffer.OrgChart.Layout.Box.special(Staffer.OrgChart.Layout.Box.None, node.getElement().id, false);
                node.addChild(verticalSpacer);
            }
        },
        /**
         * Applies layout changes to a given box and its children.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.SingleColumnLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.SingleColumnLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}                state    
         * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    level
         * @return  {void}
         */
        applyVerticalLayout: function (state, level) {
            var node = level.branchRoot;

            if (node.getLevel() === 0) {
                node.getElement().frame.siblingsRowV = new Staffer.OrgChart.Layout.Dimensions.$ctor1(node.getElement().frame.exterior.getTop(), node.getElement().frame.exterior.getBottom());
            }

            var prevRowExterior = node.getElement().frame.siblingsRowV;

            for (var row = 0; row < node.getState().numberOfSiblings; row = (row + 1) | 0) {
                // first, compute
                var child = System.Array.getItem(node.getChildren(), row, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                var rect = child.getElement().frame.exterior;

                var top = prevRowExterior.to + this.parentChildSpacing;
                child.getElement().frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(rect.getLeft(), top, rect.size.width, rect.size.height);
                child.getElement().frame.branchExterior = child.getElement().frame.exterior;

                var rowExterior = new Staffer.OrgChart.Layout.Dimensions.$ctor1(top, top + rect.size.height);

                child = System.Array.getItem(node.getChildren(), row, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                child.getElement().frame.siblingsRowV = rowExterior;

                // re-enter layout algorithm for child branch
                Staffer.OrgChart.Layout.LayoutAlgorithm.verticalLayout(state, child);

                var childBranchBottom = child.getElement().frame.branchExterior.getBottom();

                prevRowExterior = new Staffer.OrgChart.Layout.Dimensions.$ctor1(rowExterior.from, Math.max(childBranchBottom, rowExterior.to));
            }
        },
        /**
         * Applies layout changes to a given box and its children.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.SingleColumnLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.SingleColumnLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}                state    
         * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    level
         * @return  {void}
         */
        applyHorizontalLayout: function (state, level) {
            var node = level.branchRoot;

            var nodeState = node.getState();

            // first, perform horizontal layout for every node in this column
            for (var row = 0; row < nodeState.numberOfSiblings; row = (row + 1) | 0) {
                var child = System.Array.getItem(node.getChildren(), row, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));

                // re-enter layout algorithm for child branch
                // siblings are guaranteed not to offend each other
                Staffer.OrgChart.Layout.LayoutAlgorithm.horizontalLayout(state, child);
            }

            // now align the column
            var edges = Staffer.OrgChart.Layout.LayoutAlgorithm.alignHorizontalCenters(state, level, this.enumerateColumn(node));

            if (node.getLevel() > 0) {
                var rect = node.getElement().frame.exterior;
                var diff;
                if (this.parentAlignment === Staffer.OrgChart.Layout.BranchParentAlignment.Left) {
                    var desiredLeft = rect.getCenterH() + this.parentConnectorShield / 2;
                    diff = desiredLeft - edges.from;
                } else if (this.parentAlignment === Staffer.OrgChart.Layout.BranchParentAlignment.Right) {
                    var desiredRight = rect.getCenterH() - this.parentConnectorShield / 2;
                    diff = desiredRight - edges.to;
                } else {
                    throw new System.InvalidOperationException("Invalid ParentAlignment setting");
                }

                // vertical connector from parent
                Staffer.OrgChart.Layout.LayoutAlgorithm.moveChildrenOnly(state, level, diff);

                // spacer for the vertical carrier 
                var verticalSpacerBox = node.getLevel() > 0 ? System.Array.getItem(node.getChildren(), ((node.getChildCount() - 1) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement() : null;
                if (verticalSpacerBox != null) {
                    var spacerTop = node.getElement().frame.exterior.getBottom();
                    var spacerBottom = System.Array.getItem(node.getChildren(), ((node.getChildCount() - 2) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getBottom();
                    verticalSpacerBox.frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(rect.getCenterH() - this.parentConnectorShield / 2, spacerTop, this.parentConnectorShield, spacerBottom - spacerTop);
                    verticalSpacerBox.frame.branchExterior = verticalSpacerBox.frame.exterior;
                    state.mergeSpacer(verticalSpacerBox);
                }
            }
        },
        enumerateColumn: function (branchRoot) {
            var $yield = [];
            for (var i = 0; i < branchRoot.getState().numberOfSiblings; i = (i + 1) | 0) {
                $yield.push(System.Array.getItem(branchRoot.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)));
            }
            return System.Array.toEnumerable($yield);
        },
        /**
         * Allocates and routes connectors.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.SingleColumnLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.SingleColumnLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}      state    
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    node
         * @return  {void}
         */
        routeConnectors: function (state, node) {
            // one parent connector (also serves as mid-sibling carrier) and horizontal carriers
            var count = (1 + node.getState().numberOfSiblings) | 0;

            var segments = System.Array.init(count, function (){
                return new Staffer.OrgChart.Layout.Edge();
            });

            var rootRect = node.getElement().frame.exterior;
            var center = rootRect.getCenterH();

            var verticalCarrierHeight = System.Array.getItem(node.getChildren(), ((node.getState().numberOfSiblings - 1) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getCenterV() - node.getElement().frame.exterior.getBottom();

            // big vertical connector, from parent to last row
            segments[0] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(center, rootRect.getBottom()), new Staffer.OrgChart.Layout.Point.$ctor1(center, rootRect.getBottom() + verticalCarrierHeight));

            for (var ix = 0; ix < node.getState().numberOfSiblings; ix = (ix + 1) | 0) {
                var rect = System.Array.getItem(node.getChildren(), ix, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior;
                var destination = this.parentAlignment === Staffer.OrgChart.Layout.BranchParentAlignment.Left ? rect.getLeft() : rect.getRight();
                segments[((1 + ix) | 0)] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(center, rect.getCenterV()), new Staffer.OrgChart.Layout.Point.$ctor1(destination, rect.getCenterV()));
            }

            node.getElement().frame.connector = new Staffer.OrgChart.Layout.Connector(segments);
        }
    });

    /**
     * Test data source implementation.
     *
     * @public
     * @class Staffer.OrgChart.Test.TestDataSource
     * @implements  Staffer.OrgChart.Layout.IChartDataSource
     */
    Bridge.define("Staffer.OrgChart.Test.TestDataSource", {
        inherits: [Staffer.OrgChart.Layout.IChartDataSource],
        /**
         * All items.
         *
         * @instance
         * @public
         * @readonly
         * @memberof Staffer.OrgChart.Test.TestDataSource
         * @type System.Collections.Generic.Dictionary$2
         */
        items: null,
        config: {
            alias: [
            "getAllDataItemIds", "Staffer$OrgChart$Layout$IChartDataSource$getAllDataItemIds",
            "getGetParentKeyFunc", "Staffer$OrgChart$Layout$IChartDataSource$getGetParentKeyFunc"
            ],
            init: function () {
                this.items = new (System.Collections.Generic.Dictionary$2(String,Staffer.OrgChart.Test.TestDataItem))();
            }
        },
        /**
         * Access to all data items.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Test.TestDataSource
         * @memberof Staffer.OrgChart.Test.TestDataSource
         * @function getAllDataItemIds
         * @return  {System.Collections.Generic.IEnumerable$1}
         */
        /**
         * Access to all data items.
         *
         * @instance
         * @function setAllDataItemIds
         */
        getAllDataItemIds: function () {
            return this.items.getKeys();
        },
        /**
         * Delegate that provides information about parent-child relationship of boxes.
         First argument is the underlying data item id.
         Return value is the parent data item id.
         This one should be implemented by the underlying data source.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Test.TestDataSource
         * @memberof Staffer.OrgChart.Test.TestDataSource
         * @function getGetParentKeyFunc
         * @return  {System.Func}
         */
        /**
         * Delegate that provides information about parent-child relationship of boxes.
         First argument is the underlying data item id.
         Return value is the parent data item id.
         This one should be implemented by the underlying data source.
         *
         * @instance
         * @function setGetParentKeyFunc
         */
        getGetParentKeyFunc: function () {
            return Bridge.fn.bind(this, this.getParentKey);
        },
        /**
         * Implementation for {@link }.
         *
         * @instance
         * @public
         * @this Staffer.OrgChart.Test.TestDataSource
         * @memberof Staffer.OrgChart.Test.TestDataSource
         * @param   {string}    itemId
         * @return  {string}
         */
        getParentKey: function (itemId) {
            return this.items.get(itemId).parentId;
        }
    });

    /**
     * Arranges child boxes in multiple vertically stretched groups, stuffed onto "fish bones" on left and right sides of vertical carriers,
     with only one main horizontal carrier going under parent's bottom, connecting all vertical carriers.
     Can only be configured to position parent in the middle of children.
     *
     * @public
     * @class Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy
     * @augments Staffer.OrgChart.Layout.LinearLayoutStrategy
     */
    Bridge.define("Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy", {
        inherits: [Staffer.OrgChart.Layout.LinearLayoutStrategy],
        /**
         * Maximum number of boxes staffed onto a single vertical carrier.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy
         * @default 4
         * @type number
         */
        maxGroups: 4,
        /**
         * A chance for layout strategy to append special auto-generated boxes into the visual tree.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}      state    
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    node
         * @return  {void}
         */
        preProcessThisNode: function (state, node) {
            if (this.parentAlignment !== Staffer.OrgChart.Layout.BranchParentAlignment.Center) {
                throw new System.InvalidOperationException("Unsupported value for ParentAlignment");
            }

            if (this.maxGroups <= 0) {
                throw new System.InvalidOperationException("MaxGroups must be a positive value");
            }

            if (node.getChildCount() <= ((this.maxGroups * 2) | 0)) {
                Staffer.OrgChart.Layout.LinearLayoutStrategy.prototype.preProcessThisNode.call(this, state, node);
                return;
            }

            node.getState().numberOfSiblings = node.getChildCount();

            // only add spacers for non-collapsed boxes
            if (node.getState().numberOfSiblings > 0) {
                // using column == group here, 
                // and each group consists of two vertical stretches of boxes with a vertical carrier in between
                node.getState().numberOfSiblingColumns = this.maxGroups;
                node.getState().numberOfSiblingRows = (Bridge.Int.div(node.getState().numberOfSiblings, (((this.maxGroups * 2) | 0)))) | 0;
                if (node.getState().numberOfSiblings % (((this.maxGroups * 2) | 0)) !== 0) {
                    node.getState().numberOfSiblingRows = (node.getState().numberOfSiblingRows + 1) | 0;
                }

                // a connector from parent to horizontal carrier
                var parentSpacer = Staffer.OrgChart.Layout.Box.special(Staffer.OrgChart.Layout.Box.None, node.getElement().id, false);
                node.addChild(parentSpacer);

                // spacers for vertical carriers 
                for (var i = 0; i < node.getState().numberOfSiblingColumns; i = (i + 1) | 0) {
                    var verticalSpacer = Staffer.OrgChart.Layout.Box.special(Staffer.OrgChart.Layout.Box.None, node.getElement().id, false);
                    node.addChild(verticalSpacer);
                }

                // if needed, horizontal carrier 
                if (node.getState().numberOfSiblingColumns > 1) {
                    var horizontalSpacer = Staffer.OrgChart.Layout.Box.special(Staffer.OrgChart.Layout.Box.None, node.getElement().id, false);
                    node.addChild(horizontalSpacer);
                }
            }
        },
        /**
         * Applies layout changes to a given box and its children.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}                state    
         * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    level
         * @return  {void}
         */
        applyVerticalLayout: function (state, level) {
            if (level.branchRoot.getState().numberOfSiblings <= ((this.maxGroups * 2) | 0)) {
                Staffer.OrgChart.Layout.LinearLayoutStrategy.prototype.applyVerticalLayout.call(this, state, level);
                return;
            }

            var node = level.branchRoot;
            if (node.getLevel() === 0) {
                node.getElement().frame.siblingsRowV = new Staffer.OrgChart.Layout.Dimensions.$ctor1(node.getElement().frame.exterior.getTop(), node.getElement().frame.exterior.getBottom());
            }

            var adapter = new Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy.SingleFishboneLayoutAdapter(node);
            while (adapter.nextGroup()) {
                Staffer.OrgChart.Layout.LayoutAlgorithm.verticalLayout(state, adapter.specialRoot);
            }
        },
        /**
         * Applies layout changes to a given box and its children.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}                state    
         * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    level
         * @return  {void}
         */
        applyHorizontalLayout: function (state, level) {
            if (level.branchRoot.getState().numberOfSiblings <= ((this.maxGroups * 2) | 0)) {
                Staffer.OrgChart.Layout.LinearLayoutStrategy.prototype.applyHorizontalLayout.call(this, state, level);
                return;
            }

            var node = level.branchRoot;
            if (node.getLevel() === 0) {
                node.getElement().frame.siblingsRowV = new Staffer.OrgChart.Layout.Dimensions.$ctor1(node.getElement().frame.exterior.getTop(), node.getElement().frame.exterior.getBottom());
            }

            var adapter = new Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy.SingleFishboneLayoutAdapter(node);
            while (adapter.nextGroup()) {
                Staffer.OrgChart.Layout.LayoutAlgorithm.horizontalLayout(state, adapter.specialRoot);
            }

            var rect = node.getElement().frame.exterior;

            if (this.parentAlignment === Staffer.OrgChart.Layout.BranchParentAlignment.Center) {
                if (node.getLevel() > 0) {
                    var desiredCenter = rect.getCenterH();
                    if (node.getState().numberOfSiblingColumns > 1) {
                        var diff = desiredCenter - node.getElement().frame.branchExterior.getCenterH();
                        Staffer.OrgChart.Layout.LayoutAlgorithm.moveChildrenOnly(state, level, diff);
                    } else {
                        var diff1 = desiredCenter - System.Array.getItem(node.getChildren(), ((1 + node.getState().numberOfSiblings) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getCenterH();
                        Staffer.OrgChart.Layout.LayoutAlgorithm.moveChildrenOnly(state, level, diff1);
                    }
                }
            } else {
                throw new System.InvalidOperationException("Invalid ParentAlignment setting");
            }

            if (node.getLevel() > 0) {
                // vertical connector from parent
                var ix = node.getState().numberOfSiblings;
                var verticalSpacerBox = System.Array.getItem(node.getChildren(), ix, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement();
                verticalSpacerBox.frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(rect.getCenterH() - this.parentConnectorShield / 2, rect.getBottom(), this.parentConnectorShield, System.Array.getItem(node.getChildren(), 0, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.siblingsRowV.from - rect.getBottom());
                verticalSpacerBox.frame.branchExterior = verticalSpacerBox.frame.exterior;
                state.mergeSpacer(verticalSpacerBox);
                ix = (ix + 1) | 0;

                // vertical carriers already merged in
                ix = (ix + node.getState().numberOfSiblingColumns) | 0;

                if (node.getState().numberOfSiblingColumns > 1) {
                    // have a horizontal carrier
                    var horizontalSpacerBox = System.Array.getItem(node.getChildren(), ix, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement();
                    var leftmost = System.Array.getItem(node.getChildren(), ((node.getState().numberOfSiblings + 1) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getLeft();
                    var rightmost = System.Array.getItem(node.getChildren(), ((ix - 1) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getRight();
                    horizontalSpacerBox.frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(leftmost, node.getElement().frame.exterior.getBottom(), rightmost - leftmost, this.parentChildSpacing);
                    horizontalSpacerBox.frame.branchExterior = horizontalSpacerBox.frame.exterior;
                    state.mergeSpacer(horizontalSpacerBox);
                }
            }
        },
        /**
         * Allocates and routes connectors.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}      state    
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    node
         * @return  {void}
         */
        routeConnectors: function (state, node) {
            if (node.getState().numberOfSiblings <= ((this.maxGroups * 2) | 0)) {
                Staffer.OrgChart.Layout.LinearLayoutStrategy.prototype.routeConnectors.call(this, state, node);
                return;
            }

            var count = (((1 + node.getState().numberOfSiblings) | 0) + node.getState().numberOfSiblingColumns) | 0; // one for each vertical carrier
            if (node.getState().numberOfSiblingColumns > 1) {
                // also have a horizontal carrier
                count = (count + 1) | 0;
            }

            var segments = System.Array.init(count, function (){
                return new Staffer.OrgChart.Layout.Edge();
            });

            var rootRect = node.getElement().frame.exterior;
            var center = rootRect.getCenterH();

            var ix = 0;

            // parent connector
            var space = System.Array.getItem(node.getChildren(), 0, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.siblingsRowV.from - rootRect.getBottom();
            segments[Bridge.identity(ix, (ix = (ix + 1) | 0))] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(center, rootRect.getBottom()), new Staffer.OrgChart.Layout.Point.$ctor1(center, rootRect.getBottom() + space - this.childConnectorHookLength));

            // one hook for each child
            var iterator = new Staffer.OrgChart.Layout.MultiLineFishboneLayoutStrategy.SingleFishboneLayoutAdapter.GroupIterator(node.getState().numberOfSiblings, node.getState().numberOfSiblingColumns);
            while (iterator.nextGroup()) {
                var carrier = System.Array.getItem(node.getChildren(), ((((1 + node.getState().numberOfSiblings) | 0) + iterator.group) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior;
                var from = carrier.getCenterH();

                var isLeft = true;
                var countOnThisSide = 0;
                for (var i = iterator.fromIndex; i < ((iterator.fromIndex + iterator.count) | 0); i = (i + 1) | 0) {
                    var to = isLeft ? System.Array.getItem(node.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getRight() : System.Array.getItem(node.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getLeft();
                    var y = System.Array.getItem(node.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getCenterV();
                    segments[Bridge.identity(ix, (ix = (ix + 1) | 0))] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(from, y), new Staffer.OrgChart.Layout.Point.$ctor1(to, y));

                    if (((countOnThisSide = (countOnThisSide + 1) | 0)) === iterator.maxOnLeft) {
                        countOnThisSide = 0;
                        if (isLeft) {
                            // one for each vertical carrier
                            segments[((((1 + node.getState().numberOfSiblings) | 0) + iterator.group) | 0)] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(carrier.getCenterH(), carrier.getTop() - this.childConnectorHookLength), new Staffer.OrgChart.Layout.Point.$ctor1(carrier.getCenterH(), System.Array.getItem(node.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior.getCenterV()));
                        }
                        isLeft = !isLeft;
                    }
                }
            }

            // vertical carriers already created
            ix = (ix + node.getState().numberOfSiblingColumns) | 0;

            if (node.getState().numberOfSiblingColumns > 1) {
                var leftGroup = System.Array.getItem(node.getChildren(), ((1 + node.getState().numberOfSiblings) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior;
                var rightGroup = System.Array.getItem(node.getChildren(), ((((((1 + node.getState().numberOfSiblings) | 0) + node.getState().numberOfSiblingColumns) | 0) - 1) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.exterior;

                // one horizontal carrier
                segments[ix] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(leftGroup.getCenterH(), leftGroup.getTop() - this.childConnectorHookLength), new Staffer.OrgChart.Layout.Point.$ctor1(rightGroup.getCenterH(), rightGroup.getTop() - this.childConnectorHookLength));
            }

            node.getElement().frame.connector = new Staffer.OrgChart.Layout.Connector(segments);
        }
    });

    /**
     * Arranges child boxes in multiple lines under the parent.
     Can only be configured to position parent in the middle of children.
     Children are attached to long horizontal carriers,
     with a central vertical carrier going through them from parent's bottom.
     *
     * @public
     * @class Staffer.OrgChart.Layout.MultiLineHangerLayoutStrategy
     * @augments Staffer.OrgChart.Layout.LinearLayoutStrategy
     */
    Bridge.define("Staffer.OrgChart.Layout.MultiLineHangerLayoutStrategy", {
        inherits: [Staffer.OrgChart.Layout.LinearLayoutStrategy],
        /**
         * Maximum number of siblings in a horizontal row.
         *
         * @instance
         * @public
         * @memberof Staffer.OrgChart.Layout.MultiLineHangerLayoutStrategy
         * @default 4
         * @type number
         */
        maxSiblingsPerRow: 4,
        /**
         * A chance for layout strategy to append special auto-generated boxes into the visual tree.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.MultiLineHangerLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.MultiLineHangerLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}      state    
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    node
         * @return  {void}
         */
        preProcessThisNode: function (state, node) {
            if (this.parentAlignment !== Staffer.OrgChart.Layout.BranchParentAlignment.Center) {
                throw new System.InvalidOperationException("Unsupported value for ParentAlignment");
            }

            if (this.maxSiblingsPerRow <= 0 || this.maxSiblingsPerRow % 2 !== 0) {
                throw new System.InvalidOperationException("MaxSiblingsPerRow must be a positive even value");
            }

            if (node.getChildCount() <= this.maxSiblingsPerRow) {
                // fall back to linear layout, only have one row of boxes
                Staffer.OrgChart.Layout.LinearLayoutStrategy.prototype.preProcessThisNode.call(this, state, node);
                return;
            }

            node.getState().numberOfSiblings = node.getChildCount();

            // only add spacers for non-collapsed boxes
            if (node.getState().numberOfSiblings > 0) {
                var lastRowBoxCount = node.getChildCount() % this.maxSiblingsPerRow;

                // add one (for vertical spacer) into the count of layout columns
                node.getState().numberOfSiblingColumns = (1 + this.maxSiblingsPerRow) | 0;

                node.getState().numberOfSiblingRows = (Bridge.Int.div(node.getChildCount(), this.maxSiblingsPerRow)) | 0;
                if (lastRowBoxCount !== 0) {
                    node.getState().numberOfSiblingRows = (node.getState().numberOfSiblingRows + 1) | 0;
                }

                // include vertical spacers into the count of layout siblings
                node.getState().numberOfSiblings = (node.getChildCount() + node.getState().numberOfSiblingRows) | 0;
                if (lastRowBoxCount > 0 && lastRowBoxCount <= ((Bridge.Int.div(this.maxSiblingsPerRow, 2)) | 0)) {
                    // don't need the last spacer, last row is half-full or even less
                    node.getState().numberOfSiblings = (node.getState().numberOfSiblings - 1) | 0;
                }

                // sibling middle-spacers have to be inserted between siblings
                var ix = (Bridge.Int.div(this.maxSiblingsPerRow, 2)) | 0;
                while (ix < node.getState().numberOfSiblings) {
                    var siblingSpacer = Staffer.OrgChart.Layout.Box.special(Staffer.OrgChart.Layout.Box.None, node.getElement().id, false);
                    node.insertChild(ix, siblingSpacer);
                    ix = (ix + node.getState().numberOfSiblingColumns) | 0;
                }

                // add parent vertical spacer to the end
                var verticalSpacer = Staffer.OrgChart.Layout.Box.special(Staffer.OrgChart.Layout.Box.None, node.getElement().id, false);
                node.addChild(verticalSpacer);

                // add horizontal spacers to the end
                for (var i = 0; i < node.getState().numberOfSiblingRows; i = (i + 1) | 0) {
                    var horizontalSpacer = Staffer.OrgChart.Layout.Box.special(Staffer.OrgChart.Layout.Box.None, node.getElement().id, false);
                    node.addChild(horizontalSpacer);
                }
            }
        },
        /**
         * Applies layout changes to a given box and its children.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.MultiLineHangerLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.MultiLineHangerLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}                state    
         * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    level
         * @return  {void}
         */
        applyVerticalLayout: function (state, level) {
            var node = level.branchRoot;
            if (node.getState().numberOfSiblings <= this.maxSiblingsPerRow) {
                // fall back to linear layout, only have one row of boxes
                Staffer.OrgChart.Layout.LinearLayoutStrategy.prototype.applyVerticalLayout.call(this, state, level);
                return;
            }

            if (node.getLevel() === 0) {
                node.getElement().frame.siblingsRowV = new Staffer.OrgChart.Layout.Dimensions.$ctor1(node.getElement().frame.exterior.getTop(), node.getElement().frame.exterior.getBottom());
            }

            var prevRowExterior = node.getElement().frame.siblingsRowV;

            for (var row = 0; row < node.getState().numberOfSiblingRows; row = (row + 1) | 0) {
                var siblingsRowExterior = Staffer.OrgChart.Layout.Dimensions.minMax();

                // first, compute
                var from = (row * node.getState().numberOfSiblingColumns) | 0;
                var to = Math.min(((from + node.getState().numberOfSiblingColumns) | 0), node.getState().numberOfSiblings);
                for (var i = from; i < to; i = (i + 1) | 0) {
                    var child = System.Array.getItem(node.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                    if (child.getElement().isSpecial) {
                        // skip vertical spacers for now
                        continue;
                    }

                    var rect = child.getElement().frame.exterior;

                    var top = prevRowExterior.to + this.parentChildSpacing;
                    child.getElement().frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(rect.getLeft(), top, rect.size.width, rect.size.height);
                    child.getElement().frame.branchExterior = child.getElement().frame.exterior;

                    siblingsRowExterior = Staffer.OrgChart.Layout.Dimensions.op_Addition(siblingsRowExterior, new Staffer.OrgChart.Layout.Dimensions.$ctor1(top, top + rect.size.height));
                }

                siblingsRowExterior = new Staffer.OrgChart.Layout.Dimensions.$ctor1(siblingsRowExterior.from, siblingsRowExterior.to);

                var siblingsBottom = System.Double.min;
                for (var i1 = from; i1 < to; i1 = (i1 + 1) | 0) {
                    var child1 = System.Array.getItem(node.getChildren(), i1, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                    child1.getElement().frame.siblingsRowV = siblingsRowExterior;

                    // re-enter layout algorithm for child branch
                    Staffer.OrgChart.Layout.LayoutAlgorithm.verticalLayout(state, child1);

                    siblingsBottom = Math.max(siblingsBottom, child1.getElement().frame.branchExterior.getBottom());
                }

                prevRowExterior = new Staffer.OrgChart.Layout.Dimensions.$ctor1(siblingsRowExterior.from, Math.max(siblingsBottom, siblingsRowExterior.to));

                // now assign size to the vertical spacer, if any
                var spacerIndex = (from + ((Bridge.Int.div(node.getState().numberOfSiblingColumns, 2)) | 0)) | 0;
                if (spacerIndex < node.getState().numberOfSiblings) {
                    var frame = System.Array.getItem(node.getChildren(), spacerIndex, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame;
                    frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(0, prevRowExterior.from, this.parentConnectorShield, prevRowExterior.to - prevRowExterior.from);
                    frame.branchExterior = frame.exterior;
                }
            }
        },
        /**
         * Applies layout changes to a given box and its children.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.MultiLineHangerLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.MultiLineHangerLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}                state    
         * @param   {Staffer.OrgChart.Layout.LayoutState.LayoutLevel}    level
         * @return  {void}
         */
        applyHorizontalLayout: function (state, level) {
            var node = level.branchRoot;

            if (node.getState().numberOfSiblings <= this.maxSiblingsPerRow) {
                // fall back to linear layout, only have one row of boxes
                Staffer.OrgChart.Layout.LinearLayoutStrategy.prototype.applyHorizontalLayout.call(this, state, level);
                return;
            }

            for (var col = 0; col < node.getState().numberOfSiblingColumns; col = (col + 1) | 0) {
                // first, perform horizontal layout for every node in this column
                for (var row = 0; row < node.getState().numberOfSiblingRows; row = (row + 1) | 0) {
                    var ix = (((row * node.getState().numberOfSiblingColumns) | 0) + col) | 0;
                    if (ix >= node.getState().numberOfSiblings) {
                        break;
                    }

                    var child = System.Array.getItem(node.getChildren(), ix, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                    // re-enter layout algorithm for child branch
                    Staffer.OrgChart.Layout.LayoutAlgorithm.horizontalLayout(state, child);
                }

                Staffer.OrgChart.Layout.LayoutAlgorithm.alignHorizontalCenters(state, level, this.enumerateColumn(node, col));
            }

            if (this.parentAlignment === Staffer.OrgChart.Layout.BranchParentAlignment.Center) {
                var rect = node.getElement().frame.exterior;
                var spacer = System.Array.getItem(node.getChildren(), ((Bridge.Int.div(node.getState().numberOfSiblingColumns, 2)) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo));
                var desiredCenter = spacer.getElement().frame.exterior.getCenterH();
                var diff = rect.getCenterH() - desiredCenter;
                Staffer.OrgChart.Layout.LayoutAlgorithm.moveChildrenOnly(state, level, diff);

                // vertical connector from parent
                var verticalSpacerBox = System.Array.getItem(node.getChildren(), node.getState().numberOfSiblings, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement();
                verticalSpacerBox.frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor3(rect.getCenterH() - this.parentConnectorShield / 2, rect.getBottom(), this.parentConnectorShield, System.Array.getItem(node.getChildren(), 0, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.siblingsRowV.from - rect.getBottom());
                verticalSpacerBox.frame.branchExterior = verticalSpacerBox.frame.exterior;

                state.mergeSpacer(verticalSpacerBox);

                // horizontal row carrier protectors
                for (var firstInRowIndex = 0; firstInRowIndex < node.getState().numberOfSiblings; firstInRowIndex = (firstInRowIndex + node.getState().numberOfSiblingColumns) | 0) {
                    var firstInRow = System.Array.getItem(node.getChildren(), firstInRowIndex, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame;
                    var lastInRow = System.Array.getItem(node.getChildren(), Math.min(((((firstInRowIndex + node.getState().numberOfSiblingColumns) | 0) - 1) | 0), ((node.getState().numberOfSiblings - 1) | 0)), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame;

                    var horizontalSpacerBox = System.Array.getItem(node.getChildren(), ((((1 + node.getState().numberOfSiblings) | 0) + ((Bridge.Int.div(firstInRowIndex, node.getState().numberOfSiblingColumns)) | 0)) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement();
                    var r = new Staffer.OrgChart.Layout.Rect.$ctor3(firstInRow.exterior.getLeft(), firstInRow.siblingsRowV.from - this.parentChildSpacing, lastInRow.exterior.getRight() - firstInRow.exterior.getLeft(), this.parentChildSpacing);
                    horizontalSpacerBox.frame.exterior = r;

                    if (r.getRight() < verticalSpacerBox.frame.exterior.getRight()) {
                        // extend protector at least to the central carrier
                        horizontalSpacerBox.frame.exterior = new Staffer.OrgChart.Layout.Rect.$ctor1(r.topLeft, new Staffer.OrgChart.Layout.Size.$ctor1(verticalSpacerBox.frame.exterior.getRight() - r.getLeft(), r.size.height));
                    }

                    horizontalSpacerBox.frame.branchExterior = horizontalSpacerBox.frame.exterior;

                    state.mergeSpacer(horizontalSpacerBox);
                }
            } else {
                throw new System.InvalidOperationException("Invalid ParentAlignment setting");
            }
        },
        enumerateColumn: function (branchRoot, col) {
            var $yield = [];
            for (var row = 0; row < branchRoot.getState().numberOfSiblingRows; row = (row + 1) | 0) {
                var ix = (((row * branchRoot.getState().numberOfSiblingColumns) | 0) + col) | 0;
                if (ix >= branchRoot.getState().numberOfSiblings) {
                    break;
                }

                $yield.push(System.Array.getItem(branchRoot.getChildren(), ix, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)));
            }
            return System.Array.toEnumerable($yield);
        },
        /**
         * Allocates and routes connectors.
         *
         * @instance
         * @public
         * @override
         * @this Staffer.OrgChart.Layout.MultiLineHangerLayoutStrategy
         * @memberof Staffer.OrgChart.Layout.MultiLineHangerLayoutStrategy
         * @param   {Staffer.OrgChart.Layout.LayoutState}      state    
         * @param   {Staffer.OrgChart.Misc.Tree$3.TreeNode}    node
         * @return  {void}
         */
        routeConnectors: function (state, node) {
            var $t;
            if (node.getState().numberOfSiblings <= this.maxSiblingsPerRow) {
                // fall back to linear layout, only have one row of boxes
                Staffer.OrgChart.Layout.LinearLayoutStrategy.prototype.routeConnectors.call(this, state, node);
                return;
            }

            // one parent connector (also serves as mid-sibling carrier) and horizontal carriers
            var count = (1 + node.getState().numberOfSiblingRows) | 0;

            $t = Bridge.getEnumerator(node.getChildren(), "System$Collections$Generic$IEnumerable$1$Staffer$OrgChart$Misc$Tree$3$TreeNode$System$Int32$Staffer$OrgChart$Layout$Box$Staffer$OrgChart$Layout$NodeLayoutInfo$getEnumerator");
            while ($t.moveNext()) {
                var child = $t.getCurrent();
                // normal boxes get one upward hook 
                if (!child.getElement().isSpecial) {
                    count = (count + 1) | 0;
                }
            }

            var segments = System.Array.init(count, function (){
                return new Staffer.OrgChart.Layout.Edge();
            });

            var rootRect = node.getElement().frame.exterior;
            var center = rootRect.getCenterH();

            var verticalCarrierHeight = System.Array.getItem(node.getChildren(), ((node.getState().numberOfSiblings - 1) | 0), Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement().frame.siblingsRowV.from - this.childConnectorHookLength - rootRect.getBottom();

            // central mid-sibling vertical connector, from parent to last row
            segments[0] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(center, rootRect.getBottom()), new Staffer.OrgChart.Layout.Point.$ctor1(center, rootRect.getBottom() + verticalCarrierHeight));

            // short hook for each child
            var ix = 1;
            for (var i = 0; i < node.getState().numberOfSiblings; i = (i + 1) | 0) {
                var child1 = System.Array.getItem(node.getChildren(), i, Staffer.OrgChart.Misc.Tree$3.TreeNode(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)).getElement();
                if (!child1.isSpecial) {
                    var childRect = child1.frame.exterior;
                    var childCenter = childRect.getCenterH();
                    segments[Bridge.identity(ix, (ix = (ix + 1) | 0))] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(childCenter, childRect.getTop()), new Staffer.OrgChart.Layout.Point.$ctor1(childCenter, childRect.getTop() - this.childConnectorHookLength));
                }
            }

            // horizontal carriers go from leftmost child hook to righmost child hook
            // for the last row which is just half or less full, it will only go to the central vertical carrier
            var lastChildHookIndex = (((count - node.getState().numberOfSiblingRows) | 0) - 1) | 0;
            for (var firstInRowIndex = 1; firstInRowIndex < ((count - node.getState().numberOfSiblingRows) | 0); firstInRowIndex = (firstInRowIndex + this.maxSiblingsPerRow) | 0) {
                var firstInRow = segments[firstInRowIndex];

                var lastInRow = segments[Math.min(((((firstInRowIndex + this.maxSiblingsPerRow) | 0) - 1) | 0), lastChildHookIndex)];

                if (lastInRow.from.x < segments[0].from.x) {
                    segments[Bridge.identity(ix, (ix = (ix + 1) | 0))] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(firstInRow.to.x, firstInRow.to.y), new Staffer.OrgChart.Layout.Point.$ctor1(segments[0].to.x, firstInRow.to.y));
                } else {
                    segments[Bridge.identity(ix, (ix = (ix + 1) | 0))] = new Staffer.OrgChart.Layout.Edge.$ctor1(new Staffer.OrgChart.Layout.Point.$ctor1(firstInRow.to.x, firstInRow.to.y), new Staffer.OrgChart.Layout.Point.$ctor1(lastInRow.to.x, firstInRow.to.y));
                }
            }

            node.getElement().frame.connector = new Staffer.OrgChart.Layout.Connector(segments);
        }
    });

    Bridge.setMetadata(Staffer.OrgChart.Annotations.ContractAnnotationAttribute, function () { return {"members":[{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":2,"name":"Contract","type":16,"returnType":String,"getter":{"accessibility":2,"name":"get_Contract","type":8,"sname":"getContract","returnType":String},"setter":{"accessibility":1,"name":"set_Contract","type":8,"paramsInfo":[{"name":"value","parameterType":String,"position":0}],"sname":"setContract","returnType":Object,"params":[String]}}],"attrAllowMultiple":true}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.Boundary.Step, function () { return {"attr":[new System.DebuggerDisplayAttribute("{X}, {Top} - {Bottom}, {Box.Id}")],"members":[{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":2,"name":"Box","type":4,"returnType":Staffer.OrgChart.Layout.Box,"sname":"box","isReadOnly":true}]}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.Box, function () { return {"attr":[new System.DebuggerDisplayAttribute("{Id}, {Frame.Exterior.Left}:{Frame.Exterior.Top}, {Frame.Exterior.Size.Width}x{Frame.Exterior.Size.Height}")],"members":[{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":2,"name":"Special","isStatic":true,"type":8,"paramsInfo":[{"name":"id","parameterType":System.Int32,"position":0},{"name":"visualParentId","parameterType":System.Int32,"position":1},{"name":"disableCollisionDetection","parameterType":Boolean,"position":2}],"sname":"special","returnType":Staffer.OrgChart.Layout.Box,"params":[System.Int32,System.Int32,Boolean]},{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"DataId","type":4,"returnType":String,"sname":"dataId","isReadOnly":true},{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":2,"name":"Frame","type":4,"returnType":Staffer.OrgChart.Layout.Frame,"sname":"frame","isReadOnly":true},{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"LayoutStrategyId","type":4,"returnType":String,"sname":"layoutStrategyId","isReadOnly":false}]}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.BoxContainer, function () { return {"members":[{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"SystemRoot","type":16,"returnType":Staffer.OrgChart.Layout.Box,"getter":{"accessibility":2,"name":"get_SystemRoot","type":8,"sname":"getSystemRoot","returnType":Staffer.OrgChart.Layout.Box},"setter":{"accessibility":2,"name":"set_SystemRoot","type":8,"paramsInfo":[{"name":"value","parameterType":Staffer.OrgChart.Layout.Box,"position":0}],"sname":"setSystemRoot","returnType":Object,"params":[Staffer.OrgChart.Layout.Box]}}]}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.Connector, function () { return {"members":[{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":2,"name":"Segments","type":16,"returnType":Array,"getter":{"accessibility":2,"name":"get_Segments","type":8,"sname":"getSegments","returnType":Array},"setter":{"accessibility":1,"name":"set_Segments","type":8,"paramsInfo":[{"name":"value","parameterType":Array,"position":0}],"sname":"setSegments","returnType":Object,"params":[Array]}}]}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.Diagram, function () { return {"members":[{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"VisualTree","type":16,"returnType":Staffer.OrgChart.Misc.Tree$3(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo),"getter":{"accessibility":2,"name":"get_VisualTree","type":8,"sname":"getVisualTree","returnType":Staffer.OrgChart.Misc.Tree$3(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)},"setter":{"accessibility":2,"name":"set_VisualTree","type":8,"paramsInfo":[{"name":"value","parameterType":Staffer.OrgChart.Misc.Tree$3(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo),"position":0}],"sname":"setVisualTree","returnType":Object,"params":[Staffer.OrgChart.Misc.Tree$3(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)]}}]}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.DiagramLayoutSettings, function () { return {"members":[{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"DefaultLayoutStrategyId","type":16,"returnType":String,"getter":{"accessibility":2,"name":"get_DefaultLayoutStrategyId","type":8,"sname":"getDefaultLayoutStrategyId","returnType":String},"setter":{"accessibility":2,"name":"set_DefaultLayoutStrategyId","type":8,"paramsInfo":[{"name":"value","parameterType":String,"position":0}],"sname":"setDefaultLayoutStrategyId","returnType":Object,"params":[String]}},{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":2,"name":"LayoutStrategies","type":16,"returnType":System.Collections.Generic.Dictionary$2(String,Staffer.OrgChart.Layout.LayoutStrategyBase),"getter":{"accessibility":2,"name":"get_LayoutStrategies","type":8,"sname":"getLayoutStrategies","returnType":System.Collections.Generic.Dictionary$2(String,Staffer.OrgChart.Layout.LayoutStrategyBase)},"setter":{"accessibility":1,"name":"set_LayoutStrategies","type":8,"paramsInfo":[{"name":"value","parameterType":System.Collections.Generic.Dictionary$2(String,Staffer.OrgChart.Layout.LayoutStrategyBase),"position":0}],"sname":"setLayoutStrategies","returnType":Object,"params":[System.Collections.Generic.Dictionary$2(String,Staffer.OrgChart.Layout.LayoutStrategyBase)]}}]}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.Frame, function () { return {"attr":[new System.DebuggerDisplayAttribute("{Exterior.Left}:{Exterior.Top}, {Exterior.Size.Width}x{Exterior.Size.Height}")],"members":[{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"Connector","type":4,"returnType":Staffer.OrgChart.Layout.Connector,"sname":"connector","isReadOnly":false}]}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.IChartDataSource, function () { return {"members":[{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"isAbstract":true,"accessibility":2,"name":"AllDataItemIds","type":16,"returnType":System.Collections.Generic.IEnumerable$1(String),"getter":{"isAbstract":true,"accessibility":2,"name":"get_AllDataItemIds","type":8,"sname":"Staffer$OrgChart$Layout$IChartDataSource$getAllDataItemIds","returnType":System.Collections.Generic.IEnumerable$1(String)},"setter":{"isAbstract":true,"accessibility":1,"name":"set_AllDataItemIds","type":8,"paramsInfo":[{"name":"value","parameterType":System.Collections.Generic.IEnumerable$1(String),"position":0}],"sname":"Staffer$OrgChart$Layout$IChartDataSource$setAllDataItemIds","returnType":Object,"params":[System.Collections.Generic.IEnumerable$1(String)]}},{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"isAbstract":true,"accessibility":2,"name":"GetParentKeyFunc","type":16,"returnType":Function,"getter":{"isAbstract":true,"accessibility":2,"name":"get_GetParentKeyFunc","type":8,"sname":"Staffer$OrgChart$Layout$IChartDataSource$getGetParentKeyFunc","returnType":Function},"setter":{"isAbstract":true,"accessibility":1,"name":"set_GetParentKeyFunc","type":8,"paramsInfo":[{"name":"value","parameterType":Function,"position":0}],"sname":"Staffer$OrgChart$Layout$IChartDataSource$setGetParentKeyFunc","returnType":Object,"params":[Function]}}]}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.LayoutState, function () { return {"members":[{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"BoxSizeFunc","type":16,"returnType":Function,"getter":{"accessibility":2,"name":"get_BoxSizeFunc","type":8,"sname":"getBoxSizeFunc","returnType":Function},"setter":{"accessibility":2,"name":"set_BoxSizeFunc","type":8,"paramsInfo":[{"name":"value","parameterType":Function,"position":0}],"sname":"setBoxSizeFunc","returnType":Object,"params":[Function]}},{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":2,"name":"Diagram","type":16,"returnType":Staffer.OrgChart.Layout.Diagram,"getter":{"accessibility":2,"name":"get_Diagram","type":8,"sname":"getDiagram","returnType":Staffer.OrgChart.Layout.Diagram},"setter":{"accessibility":1,"name":"set_Diagram","type":8,"paramsInfo":[{"name":"value","parameterType":Staffer.OrgChart.Layout.Diagram,"position":0}],"sname":"setDiagram","returnType":Object,"params":[Staffer.OrgChart.Layout.Diagram]}},{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"VisualTree","type":16,"returnType":Staffer.OrgChart.Misc.Tree$3(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo),"getter":{"accessibility":2,"name":"get_VisualTree","type":8,"sname":"getVisualTree","returnType":Staffer.OrgChart.Misc.Tree$3(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)},"setter":{"accessibility":1,"name":"set_VisualTree","type":8,"paramsInfo":[{"name":"value","parameterType":Staffer.OrgChart.Misc.Tree$3(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo),"position":0}],"sname":"setVisualTree","returnType":Object,"params":[Staffer.OrgChart.Misc.Tree$3(System.Int32,Staffer.OrgChart.Layout.Box,Staffer.OrgChart.Layout.NodeLayoutInfo)]}},{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":1,"name":"m_layoutStack","type":4,"returnType":System.Collections.Generic.Stack$1(Staffer.OrgChart.Layout.LayoutState.LayoutLevel),"sname":"m_layoutStack","isReadOnly":true},{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":1,"name":"m_pooledBoundaries","type":4,"returnType":System.Collections.Generic.List$1(Staffer.OrgChart.Layout.Boundary),"sname":"m_pooledBoundaries","isReadOnly":true},{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"BoundaryChanged","type":2,"adder":{"accessibility":2,"name":"add_BoundaryChanged","type":8,"paramsInfo":[{"name":"value","parameterType":Function,"position":0}],"sname":"addBoundaryChanged","returnType":Object,"params":[Function]},"remover":{"accessibility":2,"name":"remove_BoundaryChanged","type":8,"paramsInfo":[{"name":"value","parameterType":Function,"position":0}],"sname":"removeBoundaryChanged","returnType":Object,"params":[Function]}},{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"OperationChanged","type":2,"adder":{"accessibility":2,"name":"add_OperationChanged","type":8,"paramsInfo":[{"name":"value","parameterType":Function,"position":0}],"sname":"addOperationChanged","returnType":Object,"params":[Function]},"remover":{"accessibility":2,"name":"remove_OperationChanged","type":8,"paramsInfo":[{"name":"value","parameterType":Function,"position":0}],"sname":"removeOperationChanged","returnType":Object,"params":[Function]}}]}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.LayoutState.LayoutLevel, function () { return {"attr":[new System.DebuggerDisplayAttribute("{BranchRoot.Element.Id}, {Boundary.BoundingRect.Top}..{Boundary.BoundingRect.Bottom}")]}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.NodeLayoutInfo, function () { return {"members":[{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":2,"name":"RequireLayoutStrategy","type":8,"sname":"requireLayoutStrategy","returnType":Staffer.OrgChart.Layout.LayoutStrategyBase}]}; });
    Bridge.setMetadata(Staffer.OrgChart.Misc.Tree$3.TreeNode, function (TKey, TValue, TValueState) { return {"members":[{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"Children","type":16,"returnType":System.Collections.Generic.IList$1(Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState)),"getter":{"accessibility":2,"name":"get_Children","type":8,"sname":"getChildren","returnType":System.Collections.Generic.IList$1(Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState))},"setter":{"accessibility":3,"name":"set_Children","type":8,"paramsInfo":[{"name":"value","parameterType":System.Collections.Generic.IList$1(Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState)),"position":0}],"sname":"setChildren","returnType":Object,"params":[System.Collections.Generic.IList$1(Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState))]}},{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"ParentNode","type":16,"returnType":Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState),"getter":{"accessibility":2,"name":"get_ParentNode","type":8,"sname":"getParentNode","returnType":Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState)},"setter":{"accessibility":2,"name":"set_ParentNode","type":8,"paramsInfo":[{"name":"value","parameterType":Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState),"position":0}],"sname":"setParentNode","returnType":Object,"params":[Staffer.OrgChart.Misc.Tree$3.TreeNode(TKey,TValue,TValueState)]}},{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":2,"name":"State","type":16,"returnType":TValueState,"getter":{"accessibility":2,"name":"get_State","type":8,"sname":"getState","returnType":TValueState},"setter":{"accessibility":1,"name":"set_State","type":8,"paramsInfo":[{"name":"value","parameterType":TValueState,"position":0}],"sname":"setState","returnType":Object,"params":[TValueState]}}]}; });
    Bridge.setMetadata(Staffer.OrgChart.Layout.Rect, function () { return {"attr":[new System.DebuggerDisplayAttribute("{TopLeft.X}:{TopLeft.Y}, {Size.Width}x{Size.Height}")]}; });
    Bridge.setMetadata(Staffer.OrgChart.Test.TestDataItem, function () { return {"members":[{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"Date1","type":4,"returnType":Date,"sname":"date1","isReadOnly":false},{"attr":[new Staffer.OrgChart.Annotations.NotNullAttribute()],"accessibility":2,"name":"Id","type":4,"returnType":String,"sname":"id","isReadOnly":false},{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"ParentId","type":4,"returnType":String,"sname":"parentId","isReadOnly":false},{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"String1","type":4,"returnType":String,"sname":"string1","isReadOnly":false},{"attr":[new Staffer.OrgChart.Annotations.CanBeNullAttribute()],"accessibility":2,"name":"String2","type":4,"returnType":String,"sname":"string2","isReadOnly":false}]}; });
});
